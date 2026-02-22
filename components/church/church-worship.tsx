/**
 * Church Worship — 4-view pill-toggled worship execution control plane.
 *
 * Views:
 *   0 -- Sets (upcoming worship set lists for each service)
 *   1 -- Rehearsals (rehearsal schedule, attendance confirmations)
 *   2 -- Team (worship team roster by role, stats)
 *   3 -- Library (song catalog grouped by category, usage analytics)
 *
 * RBAC:
 *   C1 (Senior Pastor): All 4 views, full edit/approve access
 *   C2 (Elder/Board):   All 4 views, review access
 *   C3 (Staff/Worker):  Sets, Rehearsals, Team -- no Library management
 *   C4 (Member):        Sets only (upcoming worship sets for congregation)
 *   C5 (Visitor):       Sets only (limited, just upcoming songs)
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// RBAC
import type { ChurchRoleLens } from '@/utils/church-rbac';
import {
  isElderLevel,
  isStaffLevel,
} from '@/utils/church-rbac';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: ChurchRoleLens;
  onSwitchTab?: (index: number) => void;
}

type WorshipView = 'sets' | 'rehearsals' | 'team' | 'library';

interface ViewDef {
  id: WorshipView;
  label: string;
}

const ROLE_RANK: Record<ChurchRoleLens, number> = {
  C1: 1, C2: 2, C3: 3, C4: 4, C5: 5,
};

function getAvailableViews(role: ChurchRoleLens): ViewDef[] {
  // C1/C2: all 4 views (full worship management)
  if (ROLE_RANK[role] <= 2) {
    return [
      { id: 'sets', label: 'Sets' },
      { id: 'rehearsals', label: 'Rehearsals' },
      { id: 'team', label: 'Team' },
      { id: 'library', label: 'Library' },
    ];
  }
  // C3: sets, rehearsals, team (worship team worker level)
  if (role === 'C3') {
    return [
      { id: 'sets', label: 'Sets' },
      { id: 'rehearsals', label: 'Rehearsals' },
      { id: 'team', label: 'Team' },
    ];
  }
  // C4/C5: sets only
  return [
    { id: 'sets', label: 'Sets' },
  ];
}

// =============================================================================
// INLINE MOCK DATA -- WORSHIP SETS
// =============================================================================

type SetStatus = 'draft' | 'ready' | 'published';

interface WorshipSong {
  title: string;
  artist: string;
  key: string;
  tempo: number;
  duration: string;
  arrangementNotes?: string;
  transitionNote?: string;
}

interface AuditEntry {
  action: string;
  by: string;
  date: string;
}

interface WorshipSet {
  id: string;
  serviceDate: string;
  serviceTime: string;
  serviceName: string;
  worshipLeader: string;
  status: SetStatus;
  readinessScore: number;
  songs: WorshipSong[];
  notes?: string;
  auditTrail: AuditEntry[];
}

const WORSHIP_SETS: WorshipSet[] = [
  {
    id: 'ws-1',
    serviceDate: 'Sun, Feb 22',
    serviceTime: '10:00 AM',
    serviceName: 'Morning Worship',
    worshipLeader: 'Marcus Johnson',
    status: 'published',
    readinessScore: 95,
    songs: [
      { title: 'Great Are You Lord', artist: 'All Sons & Daughters', key: 'G', tempo: 72, duration: '5:30', arrangementNotes: 'Start acoustic, build at bridge', transitionNote: 'Segue: hold last chord, keys transition' },
      { title: 'Build My Life', artist: 'Housefires', key: 'E', tempo: 68, duration: '6:15', arrangementNotes: 'Keys intro, full band at chorus 2', transitionNote: 'Modulate up, drums build to bridge' },
      { title: 'Way Maker', artist: 'Sinach', key: 'D', tempo: 72, duration: '7:00', arrangementNotes: 'Extended worship section, spontaneous', transitionNote: 'Soft landing, keys only — prayer moment' },
      { title: 'Goodness of God', artist: 'Bethel Music', key: 'A', tempo: 70, duration: '5:45', transitionNote: 'Full band re-entry at chorus' },
      { title: 'What A Beautiful Name', artist: 'Hillsong Worship', key: 'D', tempo: 68, duration: '6:00', arrangementNotes: 'Closing song, slow build to bridge' },
    ],
    notes: 'Theme: Unshakeable Faith Week 6. Transition smoothly from song 3 to 4.',
    auditTrail: [
      { action: 'Set created', by: 'Marcus Johnson', date: 'Feb 10' },
      { action: 'Songs finalized', by: 'Marcus Johnson', date: 'Feb 14' },
      { action: 'Approved & published', by: 'Pastor Carter', date: 'Feb 18' },
    ],
  },
  {
    id: 'ws-2',
    serviceDate: 'Sun, Mar 1',
    serviceTime: '10:00 AM',
    serviceName: 'Morning Worship',
    worshipLeader: 'Lisa Chen',
    status: 'ready',
    readinessScore: 78,
    songs: [
      { title: 'King of Kings', artist: 'Hillsong Worship', key: 'D', tempo: 66, duration: '5:45', transitionNote: 'Straight into next — same feel' },
      { title: 'Living Hope', artist: 'Phil Wickham', key: 'C', tempo: 70, duration: '6:00', arrangementNotes: 'Piano only verse 1', transitionNote: 'Build: add strings, drums at chorus' },
      { title: 'Holy Spirit', artist: 'Bryan & Katie Torwalt', key: 'E', tempo: 65, duration: '6:30', arrangementNotes: 'Extended outro, open for spontaneous worship', transitionNote: 'Key change — pause, worship leader cue' },
      { title: 'How Great Thou Art', artist: 'Traditional (Hymn)', key: 'G', tempo: 84, duration: '4:30', arrangementNotes: 'Contemporary arrangement, full band', transitionNote: 'Tempo shift — congregational sing-along' },
      { title: 'Blessed Assurance', artist: 'Traditional (Hymn)', key: 'F', tempo: 76, duration: '4:15' },
    ],
    notes: 'Hymn-blended set. Review key transitions between songs 3 and 4.',
    auditTrail: [
      { action: 'Set created', by: 'Lisa Chen', date: 'Feb 12' },
      { action: 'Submitted for review', by: 'Lisa Chen', date: 'Feb 16' },
    ],
  },
  {
    id: 'ws-3',
    serviceDate: 'Sun, Mar 8',
    serviceTime: '10:00 AM',
    serviceName: 'Morning Worship',
    worshipLeader: 'Marcus Johnson',
    status: 'draft',
    readinessScore: 52,
    songs: [
      { title: 'O Come to the Altar', artist: 'Elevation Worship', key: 'B', tempo: 74, duration: '5:00', transitionNote: 'Drums kick in — energy build' },
      { title: 'Reckless Love', artist: 'Cory Asbury', key: 'C', tempo: 76, duration: '6:45', arrangementNotes: 'Drums out on verse 2' },
      { title: 'Firm Foundation', artist: 'Maverick City Music', key: 'A', tempo: 76, duration: '5:30' },
      { title: 'Amazing Grace (My Chains Are Gone)', artist: 'Chris Tomlin', key: 'G', tempo: 64, duration: '5:15', arrangementNotes: 'Acoustic guitar + vocals only verse 1' },
      { title: 'Raise a Hallelujah', artist: 'Bethel Music', key: 'E', tempo: 82, duration: '6:00', arrangementNotes: 'Big finish, full band, congregation sing-along' },
    ],
    notes: 'New arrangement for Reckless Love. Needs full band rehearsal.',
    auditTrail: [
      { action: 'Draft created', by: 'Marcus Johnson', date: 'Feb 17' },
    ],
  },
];

const SET_STATUS_LABEL: Record<SetStatus, string> = {
  draft: 'Draft',
  ready: 'Ready',
  published: 'Published',
};

const SET_STATUS_COLOR: Record<SetStatus, string> = {
  draft: '#F59E0B',
  ready: '#1D9BF0',
  published: '#22C55E',
};

const SET_STATUS_ICON: Record<SetStatus, string> = {
  draft: 'pencil.circle.fill',
  ready: 'checkmark.circle',
  published: 'checkmark.circle.fill',
};

// =============================================================================
// INLINE MOCK DATA -- REHEARSALS
// =============================================================================

type RSVPStatus = 'confirmed' | 'pending' | 'declined';

interface RehearsalAttendee {
  name: string;
  role: string;
  rsvp: RSVPStatus;
}

interface Rehearsal {
  id: string;
  date: string;
  time: string;
  location: string;
  worshipLeader: string;
  type: string;
  songsToRehearse: string[];
  attendees: RehearsalAttendee[];
  actionItems?: string[];
}

const REHEARSALS: Rehearsal[] = [
  {
    id: 'rh-1',
    date: 'Thu, Feb 20',
    time: '7:00 PM - 9:00 PM',
    location: 'Sanctuary',
    worshipLeader: 'Marcus Johnson',
    type: 'Thursday Evening Rehearsal',
    songsToRehearse: ['Great Are You Lord', 'Build My Life', 'Way Maker', 'Goodness of God', 'What A Beautiful Name'],
    attendees: [
      { name: 'Marcus Johnson', role: 'Worship Leader', rsvp: 'confirmed' },
      { name: 'Mia Torres', role: 'Vocalist', rsvp: 'confirmed' },
      { name: 'David Park', role: 'Keys', rsvp: 'confirmed' },
      { name: 'James Okafor', role: 'Drums', rsvp: 'pending' },
      { name: 'Maria Gonzalez', role: 'Bass', rsvp: 'confirmed' },
      { name: 'Chris Williams', role: 'Sound Tech', rsvp: 'confirmed' },
      { name: 'Tyler Brooks', role: 'Lead Guitar', rsvp: 'confirmed' },
    ],
    actionItems: ['Transpose "Way Maker" chart to D', 'Confirm drum fill transitions for Build My Life', 'Print updated lyric sheets'],
  },
  {
    id: 'rh-2',
    date: 'Sat, Feb 22',
    time: '9:00 AM - 11:00 AM',
    location: 'Sanctuary',
    worshipLeader: 'Marcus Johnson',
    type: 'Saturday Morning Run-Through',
    songsToRehearse: ['Great Are You Lord', 'Way Maker', 'What A Beautiful Name'],
    attendees: [
      { name: 'Marcus Johnson', role: 'Worship Leader', rsvp: 'confirmed' },
      { name: 'Mia Torres', role: 'Vocalist', rsvp: 'confirmed' },
      { name: 'David Park', role: 'Keys', rsvp: 'confirmed' },
      { name: 'James Okafor', role: 'Drums', rsvp: 'confirmed' },
      { name: 'Maria Gonzalez', role: 'Bass', rsvp: 'declined' },
      { name: 'Chris Williams', role: 'Sound Tech', rsvp: 'confirmed' },
      { name: 'Amy Richards', role: 'Media/Projection', rsvp: 'confirmed' },
    ],
    actionItems: ['Test click track levels', 'Review projection cue sheet'],
  },
  {
    id: 'rh-3',
    date: 'Thu, Feb 27',
    time: '7:00 PM - 9:00 PM',
    location: 'Sanctuary',
    worshipLeader: 'Lisa Chen',
    type: 'Thursday Evening Rehearsal',
    songsToRehearse: ['King of Kings', 'Living Hope', 'Holy Spirit', 'How Great Thou Art', 'Blessed Assurance'],
    attendees: [
      { name: 'Lisa Chen', role: 'Worship Leader', rsvp: 'confirmed' },
      { name: 'Rachel Kim', role: 'Vocalist', rsvp: 'confirmed' },
      { name: 'David Park', role: 'Keys', rsvp: 'pending' },
      { name: 'James Okafor', role: 'Drums', rsvp: 'pending' },
      { name: 'Maria Gonzalez', role: 'Bass', rsvp: 'confirmed' },
      { name: 'Chris Williams', role: 'Sound Tech', rsvp: 'confirmed' },
    ],
  },
  {
    id: 'rh-4',
    date: 'Sat, Mar 7',
    time: '9:00 AM - 12:00 PM',
    location: 'Sanctuary',
    worshipLeader: 'Marcus Johnson',
    type: 'Special Event Practice (Extended)',
    songsToRehearse: ['O Come to the Altar', 'Reckless Love', 'Firm Foundation', 'Amazing Grace (My Chains Are Gone)', 'Raise a Hallelujah'],
    attendees: [
      { name: 'Marcus Johnson', role: 'Worship Leader', rsvp: 'confirmed' },
      { name: 'Mia Torres', role: 'Vocalist', rsvp: 'pending' },
      { name: 'Rachel Kim', role: 'Vocalist', rsvp: 'confirmed' },
      { name: 'David Park', role: 'Keys', rsvp: 'confirmed' },
      { name: 'James Okafor', role: 'Drums', rsvp: 'confirmed' },
      { name: 'Maria Gonzalez', role: 'Bass', rsvp: 'confirmed' },
      { name: 'Tyler Brooks', role: 'Lead Guitar', rsvp: 'confirmed' },
      { name: 'Chris Williams', role: 'Sound Tech', rsvp: 'pending' },
      { name: 'Amy Richards', role: 'Media/Projection', rsvp: 'confirmed' },
    ],
  },
  {
    id: 'rh-5',
    date: 'Wed, Mar 12',
    time: '7:00 PM - 8:30 PM',
    location: 'Worship Room B',
    worshipLeader: 'Lisa Chen',
    type: 'Vocals-Only Session',
    songsToRehearse: ['Holy Spirit', 'How Great Thou Art'],
    attendees: [
      { name: 'Lisa Chen', role: 'Worship Leader', rsvp: 'confirmed' },
      { name: 'Mia Torres', role: 'Vocalist', rsvp: 'confirmed' },
      { name: 'Rachel Kim', role: 'Vocalist', rsvp: 'confirmed' },
      { name: 'Kevin Adeyemi', role: 'Vocalist', rsvp: 'pending' },
    ],
  },
];

const RSVP_COLOR: Record<RSVPStatus, string> = {
  confirmed: '#22C55E',
  pending: '#F59E0B',
  declined: '#EF4444',
};

// =============================================================================
// INLINE MOCK DATA -- WORSHIP TEAM
// =============================================================================

type TeamStatus = 'active' | 'on-break' | 'training';
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface WorshipTeamMember {
  id: string;
  name: string;
  roles: string[];
  status: TeamStatus;
  availability: string;
  skillLevel: SkillLevel;
  joinedYear: number;
}

const WORSHIP_TEAM_MEMBERS: WorshipTeamMember[] = [
  { id: 'wtm-1', name: 'Marcus Johnson', roles: ['Worship Leader', 'Vocalist', 'Guitar'], status: 'active', availability: 'Every Sunday', skillLevel: 'expert', joinedYear: 2018 },
  { id: 'wtm-2', name: 'Lisa Chen', roles: ['Worship Leader', 'Vocalist', 'Keys'], status: 'active', availability: 'Every Sunday (Westside)', skillLevel: 'expert', joinedYear: 2022 },
  { id: 'wtm-3', name: 'Mia Torres', roles: ['Vocalist'], status: 'active', availability: '1st & 3rd Sundays', skillLevel: 'advanced', joinedYear: 2021 },
  { id: 'wtm-4', name: 'Rachel Kim', roles: ['Vocalist'], status: 'active', availability: '2nd & 4th Sundays', skillLevel: 'advanced', joinedYear: 2023 },
  { id: 'wtm-5', name: 'Kevin Adeyemi', roles: ['Vocalist'], status: 'training', availability: 'As scheduled', skillLevel: 'intermediate', joinedYear: 2025 },
  { id: 'wtm-6', name: 'Tyler Brooks', roles: ['Lead Guitar'], status: 'active', availability: 'Every Sunday', skillLevel: 'expert', joinedYear: 2019 },
  { id: 'wtm-7', name: 'Maria Gonzalez', roles: ['Bass'], status: 'active', availability: '1st, 2nd, 3rd Sundays', skillLevel: 'advanced', joinedYear: 2024 },
  { id: 'wtm-8', name: 'James Okafor', roles: ['Drums'], status: 'active', availability: 'Every Sunday', skillLevel: 'expert', joinedYear: 2022 },
  { id: 'wtm-9', name: 'David Park', roles: ['Keys'], status: 'active', availability: 'Every Sunday', skillLevel: 'expert', joinedYear: 2020 },
  { id: 'wtm-10', name: 'Chris Williams', roles: ['Sound Tech'], status: 'active', availability: 'Every Sunday', skillLevel: 'expert', joinedYear: 2019 },
  { id: 'wtm-11', name: 'Amy Richards', roles: ['Media/Projection'], status: 'active', availability: '1st & 3rd Sundays', skillLevel: 'advanced', joinedYear: 2023 },
  { id: 'wtm-12', name: 'Brian Foster', roles: ['Sound Tech'], status: 'active', availability: '2nd & 4th Sundays', skillLevel: 'intermediate', joinedYear: 2024 },
  { id: 'wtm-13', name: 'Daniel Reyes', roles: ['Lead Guitar'], status: 'on-break', availability: 'Returning March', skillLevel: 'advanced', joinedYear: 2021 },
  { id: 'wtm-14', name: 'Hannah Cole', roles: ['Keys'], status: 'training', availability: 'As scheduled', skillLevel: 'intermediate', joinedYear: 2025 },
  { id: 'wtm-15', name: 'Nathan Wright', roles: ['Media/Projection'], status: 'active', availability: '2nd & 4th Sundays', skillLevel: 'intermediate', joinedYear: 2024 },
];

const TEAM_STATUS_COLOR: Record<TeamStatus, string> = {
  active: '#22C55E',
  'on-break': '#F59E0B',
  training: '#1D9BF0',
};

const SKILL_LEVEL_COLOR: Record<SkillLevel, string> = {
  beginner: '#A1A1AA',
  intermediate: '#1D9BF0',
  advanced: '#1D9BF0',
  expert: '#22C55E',
};

const TEAM_ROLE_ORDER = [
  'Worship Leader',
  'Vocalist',
  'Lead Guitar',
  'Bass',
  'Drums',
  'Keys',
  'Tracks',
  'Sound Tech',
  'FOH',
  'Media/Projection',
  'Livestream',
];

// Coverage panel for next service
interface CoverageSlot {
  role: string;
  filled: string | null;
}

const NEXT_SERVICE_COVERAGE: CoverageSlot[] = [
  { role: 'WL', filled: 'Marcus J.' },
  { role: 'Vox 1', filled: 'Sarah M.' },
  { role: 'Vox 2', filled: 'Rachel K.' },
  { role: 'Vox 3', filled: null },
  { role: 'Keys', filled: 'David P.' },
  { role: 'Guitar', filled: 'Tyler B.' },
  { role: 'Bass', filled: 'Maria G.' },
  { role: 'Drums', filled: 'James O.' },
  { role: 'Tracks', filled: null },
  { role: 'FOH', filled: 'Chris W.' },
  { role: 'Livestream', filled: 'Amy R.' },
  { role: 'Slides', filled: null },
];

// =============================================================================
// INLINE MOCK DATA -- SONG LIBRARY
// =============================================================================

type SongCategory = 'Praise & Worship' | 'Hymns' | 'Contemporary' | 'Gospel' | 'Special';

interface LibrarySong {
  id: string;
  title: string;
  artist: string;
  category: SongCategory;
  keyOptions: string[];
  lastPlayed: string;
  timesPlayed: number;
  avgRating: number;
  hasCharts?: boolean;
  hasLyrics?: boolean;
  hasStems?: boolean;
  arrangementNotes?: string;
}

const SONG_LIBRARY: LibrarySong[] = [
  // Praise & Worship
  { id: 'sl-1', title: 'Way Maker', artist: 'Sinach', category: 'Praise & Worship', keyOptions: ['D', 'E', 'G'], lastPlayed: 'Feb 16', timesPlayed: 42, avgRating: 4.8, hasCharts: true, hasLyrics: true, hasStems: true, arrangementNotes: 'Extended bridge section for spontaneous worship' },
  { id: 'sl-2', title: 'Build My Life', artist: 'Housefires', category: 'Praise & Worship', keyOptions: ['E', 'G'], lastPlayed: 'Feb 9', timesPlayed: 38, avgRating: 4.7, hasCharts: true, hasLyrics: true, hasStems: false, arrangementNotes: 'Keys intro, full band at chorus 2' },
  { id: 'sl-3', title: 'Great Are You Lord', artist: 'All Sons & Daughters', category: 'Praise & Worship', keyOptions: ['G', 'A'], lastPlayed: 'Feb 2', timesPlayed: 35, avgRating: 4.6, hasCharts: true, hasLyrics: true, hasStems: true },
  { id: 'sl-4', title: 'Holy Spirit', artist: 'Bryan & Katie Torwalt', category: 'Praise & Worship', keyOptions: ['E', 'D'], lastPlayed: 'Jan 26', timesPlayed: 28, avgRating: 4.5, hasCharts: true, hasLyrics: true, hasStems: false },
  { id: 'sl-5', title: 'Goodness of God', artist: 'Bethel Music', category: 'Praise & Worship', keyOptions: ['A', 'G'], lastPlayed: 'Feb 16', timesPlayed: 45, avgRating: 4.9, hasCharts: true, hasLyrics: true, hasStems: true, arrangementNotes: 'Slow build, full band at chorus 3' },
  { id: 'sl-6', title: 'What A Beautiful Name', artist: 'Hillsong Worship', category: 'Praise & Worship', keyOptions: ['D', 'E'], lastPlayed: 'Jan 19', timesPlayed: 52, avgRating: 4.8, hasCharts: true, hasLyrics: true, hasStems: true },
  // Hymns
  { id: 'sl-7', title: 'Amazing Grace (My Chains Are Gone)', artist: 'Chris Tomlin', category: 'Hymns', keyOptions: ['G', 'A'], lastPlayed: 'Jan 12', timesPlayed: 30, avgRating: 4.7 },
  { id: 'sl-8', title: 'How Great Thou Art', artist: 'Traditional', category: 'Hymns', keyOptions: ['G', 'A', 'Bb'], lastPlayed: 'Jan 5', timesPlayed: 24, avgRating: 4.6 },
  { id: 'sl-9', title: 'Great Is Thy Faithfulness', artist: 'Traditional', category: 'Hymns', keyOptions: ['D', 'E'], lastPlayed: 'Dec 29', timesPlayed: 18, avgRating: 4.5 },
  { id: 'sl-10', title: 'Blessed Assurance', artist: 'Traditional', category: 'Hymns', keyOptions: ['F', 'G'], lastPlayed: 'Dec 22', timesPlayed: 15, avgRating: 4.4 },
  { id: 'sl-11', title: 'It Is Well With My Soul', artist: 'Traditional', category: 'Hymns', keyOptions: ['C', 'D'], lastPlayed: 'Nov 24', timesPlayed: 20, avgRating: 4.8 },
  // Contemporary
  { id: 'sl-12', title: 'King of Kings', artist: 'Hillsong Worship', category: 'Contemporary', keyOptions: ['D', 'E'], lastPlayed: 'Feb 2', timesPlayed: 22, avgRating: 4.5 },
  { id: 'sl-13', title: 'Living Hope', artist: 'Phil Wickham', category: 'Contemporary', keyOptions: ['C', 'D'], lastPlayed: 'Jan 26', timesPlayed: 19, avgRating: 4.4 },
  { id: 'sl-14', title: 'Reckless Love', artist: 'Cory Asbury', category: 'Contemporary', keyOptions: ['C', 'Bb'], lastPlayed: 'Jan 12', timesPlayed: 32, avgRating: 4.6 },
  { id: 'sl-15', title: 'O Come to the Altar', artist: 'Elevation Worship', category: 'Contemporary', keyOptions: ['B', 'A'], lastPlayed: 'Jan 5', timesPlayed: 26, avgRating: 4.3 },
  { id: 'sl-16', title: 'Raise a Hallelujah', artist: 'Bethel Music', category: 'Contemporary', keyOptions: ['E', 'D'], lastPlayed: 'Dec 15', timesPlayed: 14, avgRating: 4.2 },
  { id: 'sl-17', title: 'Firm Foundation', artist: 'Maverick City Music', category: 'Contemporary', keyOptions: ['A', 'G'], lastPlayed: 'Feb 9', timesPlayed: 16, avgRating: 4.5 },
  // Gospel
  { id: 'sl-18', title: 'Total Praise', artist: 'Richard Smallwood', category: 'Gospel', keyOptions: ['Db', 'D'], lastPlayed: 'Dec 8', timesPlayed: 12, avgRating: 4.7 },
  { id: 'sl-19', title: 'Every Praise', artist: 'Hezekiah Walker', category: 'Gospel', keyOptions: ['Ab', 'A'], lastPlayed: 'Nov 17', timesPlayed: 10, avgRating: 4.3 },
  { id: 'sl-20', title: 'No Longer Slaves', artist: 'Bethel Music', category: 'Gospel', keyOptions: ['E', 'F'], lastPlayed: 'Dec 1', timesPlayed: 18, avgRating: 4.6 },
  { id: 'sl-21', title: 'Jireh', artist: 'Maverick City Music / Elevation', category: 'Gospel', keyOptions: ['B', 'C'], lastPlayed: 'Jan 19', timesPlayed: 24, avgRating: 4.8 },
  // Special
  { id: 'sl-22', title: 'O Holy Night', artist: 'Traditional (Christmas)', category: 'Special', keyOptions: ['C', 'Bb'], lastPlayed: 'Dec 24', timesPlayed: 8, avgRating: 4.9 },
  { id: 'sl-23', title: 'Were You There', artist: 'Traditional (Easter)', category: 'Special', keyOptions: ['Eb', 'F'], lastPlayed: 'Apr 2025', timesPlayed: 5, avgRating: 4.5 },
  { id: 'sl-24', title: 'Christ the Lord Is Risen Today', artist: 'Traditional (Easter)', category: 'Special', keyOptions: ['C', 'D'], lastPlayed: 'Apr 2025', timesPlayed: 6, avgRating: 4.6 },
  { id: 'sl-25', title: 'Come Thou Fount', artist: 'Traditional / David Crowder', category: 'Special', keyOptions: ['E', 'D', 'G'], lastPlayed: 'Nov 3', timesPlayed: 11, avgRating: 4.4 },
];

const CATEGORY_COLOR: Record<SongCategory, string> = {
  'Praise & Worship': '#1D9BF0',
  Hymns: '#F59E0B',
  Contemporary: '#1D9BF0',
  Gospel: '#1D9BF0',
  Special: '#22C55E',
};

const CATEGORIES_ORDERED: SongCategory[] = ['Praise & Worship', 'Hymns', 'Contemporary', 'Gospel', 'Special'];

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors, count, action }: { title: string; colors: typeof Colors.light; count?: number; action?: string }) {
  return (
    <View style={sh.headerRow}>
      <ThemedText style={[sh.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
      {count != null && (
        <View style={[sh.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[sh.countText, { color: colors.textSecondary }]}>{count}</ThemedText>
        </View>
      )}
      {action && (
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={sh.actionBtn}>
          <ThemedText style={[sh.actionText, { color: colors.textTertiary }]}>{action}</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

function Card({ colors, children }: { colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[sh.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

function KPIBox({ label, value, colors, accent }: { label: string; value: string | number; colors: typeof Colors.light; accent?: string }) {
  return (
    <View style={sh.kpiBox}>
      <ThemedText style={[sh.kpiValue, { color: accent || colors.text }]}>{value}</ThemedText>
      <ThemedText style={[sh.kpiLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

const sh = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  countBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  countText: { fontSize: 10, fontWeight: '600' },
  actionBtn: { marginLeft: 'auto' },
  actionText: { fontSize: 12, fontWeight: '500' },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: StyleSheet.hairlineWidth },
  kpiBox: { alignItems: 'center', flex: 1, paddingVertical: 4 },
  kpiValue: { fontSize: 20, fontWeight: '700' },
  kpiLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2, textAlign: 'center' },
});

// =============================================================================
// VIEW: SETS (DEFAULT)
// =============================================================================

function SetsView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const totalSongs = WORSHIP_SETS.reduce((sum, ws) => sum + ws.songs.length, 0);
  const totalDuration = WORSHIP_SETS.reduce((sum, ws) => {
    return sum + ws.songs.reduce((s2, song) => {
      const parts = song.duration.split(':');
      return s2 + parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }, 0);
  }, 0);
  const avgDurationMin = Math.round(totalDuration / WORSHIP_SETS.length / 60);
  const avgReadiness = Math.round(WORSHIP_SETS.reduce((sum, ws) => sum + ws.readinessScore, 0) / WORSHIP_SETS.length);

  return (
    <>
      {/* KPIs -- staff+ */}
      {isStaffLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="WORSHIP OVERVIEW" colors={colors} />
          <Card colors={colors}>
            <View style={s.kpiRow}>
              <KPIBox label="Upcoming Sets" value={WORSHIP_SETS.length} colors={colors} accent="#1D9BF0" />
              <KPIBox label="Total Songs" value={totalSongs} colors={colors} />
              <KPIBox label="Avg Duration" value={`${avgDurationMin}m`} colors={colors} />
              <KPIBox
                label="Avg Readiness"
                value={`${avgReadiness}%`}
                colors={colors}
                accent={avgReadiness >= 80 ? '#22C55E' : avgReadiness >= 60 ? '#F59E0B' : '#EF4444'}
              />
            </View>
          </Card>
        </View>
      )}

      {/* Worship Sets */}
      <View style={s.moduleContainer}>
        <SectionHeader title="UPCOMING SETS" colors={colors} count={WORSHIP_SETS.length} />
        {WORSHIP_SETS.map((ws) => (
          <Card key={ws.id} colors={colors}>
            {/* Set header */}
            <View style={s.setHeader}>
              <View style={s.setHeaderLeft}>
                <ThemedText style={[s.setDate, { color: colors.text }]}>{ws.serviceDate}</ThemedText>
                <ThemedText style={[s.setMeta, { color: colors.textSecondary }]}>
                  {ws.serviceName} {'\u00B7'} {ws.serviceTime}
                </ThemedText>
                {isStaffLevel(role) && (
                  <ThemedText style={[s.setLeader, { color: colors.textTertiary }]}>
                    Led by {ws.worshipLeader}
                  </ThemedText>
                )}
              </View>
              <View style={[s.setStatusBadge, { backgroundColor: SET_STATUS_COLOR[ws.status] + '20' }]}>
                <IconSymbol name={SET_STATUS_ICON[ws.status] as any} size={10} color={SET_STATUS_COLOR[ws.status]} />
                <ThemedText style={[s.setStatusText, { color: SET_STATUS_COLOR[ws.status] }]}>
                  {SET_STATUS_LABEL[ws.status]}
                </ThemedText>
              </View>
            </View>

            {/* Readiness score bar */}
            {isStaffLevel(role) && (
              <View style={s.setReadinessRow}>
                <ThemedText style={[s.setReadinessLabel, { color: colors.textTertiary }]}>Readiness</ThemedText>
                <View style={[s.setReadinessTrack, { backgroundColor: colors.backgroundTertiary }]}>
                  <View style={[s.setReadinessFill, {
                    width: `${ws.readinessScore}%`,
                    backgroundColor: ws.readinessScore >= 85 ? '#22C55E' : ws.readinessScore >= 60 ? '#F59E0B' : '#EF4444',
                  }]} />
                </View>
                <ThemedText style={[s.setReadinessValue, {
                  color: ws.readinessScore >= 85 ? '#22C55E' : ws.readinessScore >= 60 ? '#F59E0B' : '#EF4444',
                }]}>{ws.readinessScore}%</ThemedText>
              </View>
            )}

            {/* Song list */}
            <View style={s.songList}>
              {ws.songs.map((song, idx) => (
                <React.Fragment key={`${ws.id}-${idx}`}>
                  <View
                    style={[
                      s.songRow,
                      idx < ws.songs.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <View style={s.songNumber}>
                      <ThemedText style={[s.songNumberText, { color: colors.textTertiary }]}>
                        {idx + 1}
                      </ThemedText>
                    </View>
                    <View style={s.songInfo}>
                      <ThemedText style={[s.songTitle, { color: colors.text }]} numberOfLines={1}>
                        {song.title}
                      </ThemedText>
                      <ThemedText style={[s.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>
                        {song.artist}
                      </ThemedText>
                      {isStaffLevel(role) && song.arrangementNotes && (
                        <ThemedText style={[s.songArrangement, { color: colors.textTertiary }]} numberOfLines={1}>
                          {song.arrangementNotes}
                        </ThemedText>
                      )}
                    </View>
                    <View style={s.songDetails}>
                      <View style={[s.songKeyBadge, { backgroundColor: colors.backgroundTertiary }]}>
                        <ThemedText style={[s.songKeyText, { color: colors.textSecondary }]}>{song.key}</ThemedText>
                      </View>
                      {isStaffLevel(role) && (
                        <ThemedText style={[s.songTempo, { color: colors.textTertiary }]}>
                          {song.tempo} bpm
                        </ThemedText>
                      )}
                      <ThemedText style={[s.songDuration, { color: colors.textTertiary }]}>
                        {song.duration}
                      </ThemedText>
                    </View>
                  </View>
                  {/* Transition note between songs */}
                  {isStaffLevel(role) && song.transitionNote && idx < ws.songs.length - 1 && (
                    <View style={s.transitionRow}>
                      <IconSymbol name="arrow.down" size={8} color={colors.textTertiary} />
                      <ThemedText style={[s.transitionText, { color: colors.textTertiary }]}>
                        {song.transitionNote}
                      </ThemedText>
                    </View>
                  )}
                </React.Fragment>
              ))}
            </View>

            {/* Notes + Approve (C1/C2) */}
            {isElderLevel(role) && ws.notes && (
              <View style={s.setNotesContainer}>
                <ThemedText style={[s.setNotesLabel, { color: colors.textTertiary }]}>Notes:</ThemedText>
                <ThemedText style={[s.setNotesText, { color: colors.textSecondary }]}>{ws.notes}</ThemedText>
              </View>
            )}

            {/* Status action (Draft→Ready, Ready→Published) */}
            {isElderLevel(role) && ws.status !== 'published' && (
              <Pressable
                style={({ pressed }) => [
                  s.approveButton,
                  { backgroundColor: ws.status === 'draft' ? '#1D9BF0' : '#22C55E', opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <IconSymbol name={ws.status === 'draft' ? 'arrow.right.circle.fill' : 'checkmark.circle.fill' as any} size={14} color="#fff" />
                <ThemedText style={s.approveButtonText}>
                  {ws.status === 'draft' ? 'Mark Ready' : 'Publish Set'}
                </ThemedText>
              </Pressable>
            )}

            {/* Audit trail */}
            {isElderLevel(role) && ws.auditTrail.length > 0 && (
              <View style={s.auditTrailContainer}>
                <ThemedText style={[s.auditTrailLabel, { color: colors.textTertiary }]}>AUDIT TRAIL</ThemedText>
                {ws.auditTrail.map((entry, ai) => (
                  <View key={ai} style={s.auditRow}>
                    <View style={[s.auditDot, { backgroundColor: colors.textTertiary }]} />
                    <ThemedText style={[s.auditText, { color: colors.textTertiary }]}>
                      {entry.action} — {entry.by} ({entry.date})
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </Card>
        ))}
      </View>
    </>
  );
}

// =============================================================================
// VIEW: REHEARSALS
// =============================================================================

function RehearsalsView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const totalRehearsals = REHEARSALS.length;
  const totalConfirmed = REHEARSALS.reduce(
    (sum, r) => sum + r.attendees.filter((a) => a.rsvp === 'confirmed').length,
    0,
  );
  const totalAttendees = REHEARSALS.reduce((sum, r) => sum + r.attendees.length, 0);

  return (
    <>
      {/* KPIs */}
      <View style={s.moduleContainer}>
        <SectionHeader title="REHEARSAL OVERVIEW" colors={colors} />
        <Card colors={colors}>
          <View style={s.kpiRow}>
            <KPIBox label="Upcoming" value={totalRehearsals} colors={colors} accent="#1D9BF0" />
            <KPIBox label="Confirmed" value={totalConfirmed} colors={colors} accent="#22C55E" />
            <KPIBox label="Pending" value={totalAttendees - totalConfirmed - REHEARSALS.reduce((sum, r) => sum + r.attendees.filter((a) => a.rsvp === 'declined').length, 0)} colors={colors} accent="#F59E0B" />
            <KPIBox label="Avg Size" value={Math.round(totalAttendees / totalRehearsals)} colors={colors} />
          </View>
        </Card>
      </View>

      {/* Rehearsal Cards */}
      <View style={s.moduleContainer}>
        <SectionHeader title="UPCOMING REHEARSALS" colors={colors} count={totalRehearsals} />
        {REHEARSALS.map((rehearsal) => {
          const confirmed = rehearsal.attendees.filter((a) => a.rsvp === 'confirmed').length;
          const pending = rehearsal.attendees.filter((a) => a.rsvp === 'pending').length;
          const declined = rehearsal.attendees.filter((a) => a.rsvp === 'declined').length;

          return (
            <Card key={rehearsal.id} colors={colors}>
              {/* Header */}
              <View style={s.rehearsalHeader}>
                <View style={s.rehearsalHeaderLeft}>
                  <ThemedText style={[s.rehearsalDate, { color: colors.text }]}>{rehearsal.date}</ThemedText>
                  <ThemedText style={[s.rehearsalType, { color: colors.textSecondary }]}>{rehearsal.type}</ThemedText>
                  <ThemedText style={[s.rehearsalTimeLoc, { color: colors.textTertiary }]}>
                    {rehearsal.time} {'\u00B7'} {rehearsal.location}
                  </ThemedText>
                  <ThemedText style={[s.rehearsalLeader, { color: colors.textTertiary }]}>
                    Leader: {rehearsal.worshipLeader}
                  </ThemedText>
                </View>
                <View style={s.rehearsalRSVPSummary}>
                  <View style={s.rsvpSummaryRow}>
                    <View style={[s.rsvpDot, { backgroundColor: '#22C55E' }]} />
                    <ThemedText style={[s.rsvpCount, { color: colors.text }]}>{confirmed}</ThemedText>
                  </View>
                  <View style={s.rsvpSummaryRow}>
                    <View style={[s.rsvpDot, { backgroundColor: '#F59E0B' }]} />
                    <ThemedText style={[s.rsvpCount, { color: colors.text }]}>{pending}</ThemedText>
                  </View>
                  {declined > 0 && (
                    <View style={s.rsvpSummaryRow}>
                      <View style={[s.rsvpDot, { backgroundColor: '#EF4444' }]} />
                      <ThemedText style={[s.rsvpCount, { color: colors.text }]}>{declined}</ThemedText>
                    </View>
                  )}
                </View>
              </View>

              {/* Songs to rehearse */}
              <View style={s.rehearsalSongsContainer}>
                <ThemedText style={[s.rehearsalSongsLabel, { color: colors.textTertiary }]}>SONGS TO PRACTICE</ThemedText>
                <View style={s.rehearsalSongTags}>
                  {rehearsal.songsToRehearse.map((songName, idx) => (
                    <View key={idx} style={[s.rehearsalSongTag, { backgroundColor: colors.backgroundTertiary }]}>
                      <ThemedText style={[s.rehearsalSongTagText, { color: colors.textSecondary }]}>{songName}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>

              {/* Action Items */}
              {rehearsal.actionItems && rehearsal.actionItems.length > 0 && isStaffLevel(role) && (
                <View style={s.actionItemsContainer}>
                  <ThemedText style={[s.actionItemsLabel, { color: colors.textTertiary }]}>ACTION ITEMS</ThemedText>
                  {rehearsal.actionItems.map((item, ai) => (
                    <View key={ai} style={s.actionItemRow}>
                      <IconSymbol name="circle" size={10} color={colors.textTertiary} />
                      <ThemedText style={[s.actionItemText, { color: colors.textSecondary }]}>{item}</ThemedText>
                    </View>
                  ))}
                </View>
              )}

              {/* Attendees */}
              {isStaffLevel(role) && (
                <View style={s.rehearsalAttendeesContainer}>
                  <ThemedText style={[s.rehearsalAttendeesLabel, { color: colors.textTertiary }]}>TEAM</ThemedText>
                  {rehearsal.attendees.map((attendee, idx) => (
                    <View
                      key={`${rehearsal.id}-att-${idx}`}
                      style={[
                        s.attendeeRow,
                        idx < rehearsal.attendees.length - 1 && {
                          borderBottomWidth: StyleSheet.hairlineWidth,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <View style={[s.attendeeAvatar, { backgroundColor: colors.backgroundTertiary }]}>
                        <ThemedText style={[s.attendeeInitials, { color: colors.textSecondary }]}>
                          {attendee.name.split(' ').map((n) => n[0]).join('')}
                        </ThemedText>
                      </View>
                      <View style={s.attendeeInfo}>
                        <ThemedText style={[s.attendeeName, { color: colors.text }]}>{attendee.name}</ThemedText>
                        <ThemedText style={[s.attendeeRole, { color: colors.textSecondary }]}>{attendee.role}</ThemedText>
                      </View>
                      <View style={[s.rsvpBadge, { backgroundColor: RSVP_COLOR[attendee.rsvp] + '20' }]}>
                        <View style={[s.rsvpDot, { backgroundColor: RSVP_COLOR[attendee.rsvp] }]} />
                        <ThemedText style={[s.rsvpBadgeText, { color: RSVP_COLOR[attendee.rsvp] }]}>
                          {attendee.rsvp.toUpperCase()}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          );
        })}
      </View>
    </>
  );
}

// =============================================================================
// VIEW: TEAM
// =============================================================================

function TeamView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const activeCount = WORSHIP_TEAM_MEMBERS.filter((m) => m.status === 'active').length;
  const onBreakCount = WORSHIP_TEAM_MEMBERS.filter((m) => m.status === 'on-break').length;
  const trainingCount = WORSHIP_TEAM_MEMBERS.filter((m) => m.status === 'training').length;

  // Group by primary role
  const groupedByRole: Record<string, WorshipTeamMember[]> = {};
  for (const member of WORSHIP_TEAM_MEMBERS) {
    const primaryRole = member.roles[0];
    if (!groupedByRole[primaryRole]) {
      groupedByRole[primaryRole] = [];
    }
    groupedByRole[primaryRole].push(member);
  }

  // Sort role groups by defined order
  const orderedRoles = TEAM_ROLE_ORDER.filter((r) => groupedByRole[r] && groupedByRole[r].length > 0);

  return (
    <>
      {/* KPIs */}
      <View style={s.moduleContainer}>
        <SectionHeader title="TEAM OVERVIEW" colors={colors} />
        <Card colors={colors}>
          <View style={s.kpiRow}>
            <KPIBox label="Total" value={WORSHIP_TEAM_MEMBERS.length} colors={colors} accent="#1D9BF0" />
            <KPIBox label="Active" value={activeCount} colors={colors} accent="#22C55E" />
            <KPIBox label="On Break" value={onBreakCount} colors={colors} accent="#F59E0B" />
            <KPIBox label="Training" value={trainingCount} colors={colors} accent="#1D9BF0" />
          </View>
        </Card>
      </View>

      {/* Next Service Coverage Grid */}
      {isStaffLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="NEXT SERVICE COVERAGE" colors={colors} action="Sun, Feb 22 — 10 AM" />
          <Card colors={colors}>
            <View style={s.coverageGrid}>
              {NEXT_SERVICE_COVERAGE.map((slot) => {
                const isFilled = slot.filled !== null;
                return (
                  <View key={slot.role} style={[s.coverageCell, { backgroundColor: isFilled ? '#22C55E10' : '#EF444410', borderColor: isFilled ? '#22C55E30' : '#EF444430' }]}>
                    <ThemedText style={[s.coverageRole, { color: isFilled ? '#22C55E' : '#EF4444' }]}>{slot.role}</ThemedText>
                    <ThemedText style={[s.coverageName, { color: isFilled ? colors.text : '#EF4444' }]} numberOfLines={1}>
                      {slot.filled ?? 'OPEN'}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
            <View style={s.coverageSummaryRow}>
              <ThemedText style={[s.coverageSummaryText, { color: colors.textTertiary }]}>
                {NEXT_SERVICE_COVERAGE.filter((s2) => s2.filled).length}/{NEXT_SERVICE_COVERAGE.length} filled
              </ThemedText>
              <ThemedText style={[s.coverageSummaryText, { color: '#EF4444' }]}>
                {NEXT_SERVICE_COVERAGE.filter((s2) => !s2.filled).length} open
              </ThemedText>
            </View>
          </Card>
        </View>
      )}

      {/* Add Member button (C1/C2) */}
      {isElderLevel(role) && (
        <View style={s.moduleContainer}>
          <Pressable
            style={({ pressed }) => [
              s.addMemberButton,
              { backgroundColor: colors.text, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <IconSymbol name="plus.circle.fill" size={16} color={colors.background} />
            <ThemedText style={[s.addMemberText, { color: colors.background }]}>Add Member</ThemedText>
          </Pressable>
        </View>
      )}

      {/* Team by Role */}
      {orderedRoles.map((roleName) => {
        const members = groupedByRole[roleName];
        return (
          <View key={roleName} style={s.moduleContainer}>
            <SectionHeader title={roleName.toUpperCase()} colors={colors} count={members.length} />
            <Card colors={colors}>
              {members.map((member, idx) => (
                <View
                  key={member.id}
                  style={[
                    s.teamMemberRow,
                    idx < members.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={[s.teamAvatar, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[s.teamAvatarText, { color: colors.textSecondary }]}>
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </ThemedText>
                  </View>
                  <View style={s.teamInfo}>
                    <ThemedText style={[s.teamName, { color: colors.text }]}>{member.name}</ThemedText>
                    <ThemedText style={[s.teamRoles, { color: colors.textSecondary }]}>
                      {member.roles.join(' / ')}
                    </ThemedText>
                    <ThemedText style={[s.teamAvailability, { color: colors.textTertiary }]}>
                      {member.availability}
                    </ThemedText>
                    {isElderLevel(role) && (
                      <View style={s.teamExtraRow}>
                        <View style={[s.skillBadge, { backgroundColor: SKILL_LEVEL_COLOR[member.skillLevel] + '20' }]}>
                          <ThemedText style={[s.skillBadgeText, { color: SKILL_LEVEL_COLOR[member.skillLevel] }]}>
                            {member.skillLevel.toUpperCase()}
                          </ThemedText>
                        </View>
                        <ThemedText style={[s.teamSince, { color: colors.textTertiary }]}>
                          Since {member.joinedYear}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  <View style={[s.teamStatusBadge, { backgroundColor: TEAM_STATUS_COLOR[member.status] + '20' }]}>
                    <View style={[s.teamStatusDot, { backgroundColor: TEAM_STATUS_COLOR[member.status] }]} />
                    <ThemedText style={[s.teamStatusText, { color: TEAM_STATUS_COLOR[member.status] }]}>
                      {member.status === 'on-break' ? 'On Break' : member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        );
      })}

      {/* Rotation Schedule (C1/C2 only) */}
      {isElderLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="ROTATION SCHEDULE" colors={colors} />
          <Card colors={colors}>
            <View style={s.rotationRow}>
              <ThemedText style={[s.rotationLabel, { color: colors.textSecondary }]}>1st & 3rd Sundays</ThemedText>
              <ThemedText style={[s.rotationValue, { color: colors.text }]}>Marcus Johnson (Lead), Mia Torres, Tyler Brooks, Amy Richards</ThemedText>
            </View>
            <View style={[s.rotationRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <ThemedText style={[s.rotationLabel, { color: colors.textSecondary }]}>2nd & 4th Sundays</ThemedText>
              <ThemedText style={[s.rotationValue, { color: colors.text }]}>Lisa Chen (Lead), Rachel Kim, Brian Foster, Nathan Wright</ThemedText>
            </View>
            <View style={[s.rotationRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <ThemedText style={[s.rotationLabel, { color: colors.textSecondary }]}>Every Sunday (Core)</ThemedText>
              <ThemedText style={[s.rotationValue, { color: colors.text }]}>David Park (Keys), James Okafor (Drums), Chris Williams (Sound)</ThemedText>
            </View>
          </Card>
        </View>
      )}
    </>
  );
}

// =============================================================================
// VIEW: LIBRARY
// =============================================================================

function LibraryView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const totalSongs = SONG_LIBRARY.length;
  const avgRating = (SONG_LIBRARY.reduce((sum, s2) => sum + s2.avgRating, 0) / totalSongs).toFixed(1);
  const totalPlays = SONG_LIBRARY.reduce((sum, s2) => sum + s2.timesPlayed, 0);

  return (
    <>
      {/* KPIs */}
      <View style={s.moduleContainer}>
        <SectionHeader title="LIBRARY OVERVIEW" colors={colors} />
        <Card colors={colors}>
          <View style={s.kpiRow}>
            <KPIBox label="Total Songs" value={totalSongs} colors={colors} accent="#1D9BF0" />
            <KPIBox label="Categories" value={CATEGORIES_ORDERED.length} colors={colors} />
            <KPIBox label="Total Plays" value={totalPlays} colors={colors} accent="#1D9BF0" />
            <KPIBox label="Avg Rating" value={avgRating} colors={colors} accent="#F59E0B" />
          </View>
        </Card>
      </View>

      {/* Search bar (mock) */}
      <View style={s.moduleContainer}>
        <Pressable
          style={[s.searchBar, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <ThemedText style={[s.searchPlaceholder, { color: colors.textTertiary }]}>Search songs...</ThemedText>
        </Pressable>
      </View>

      {/* Add Song button (C1/C2) */}
      {isElderLevel(role) && (
        <View style={s.moduleContainer}>
          <Pressable
            style={({ pressed }) => [
              s.addMemberButton,
              { backgroundColor: colors.text, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <IconSymbol name="plus.circle.fill" size={16} color={colors.background} />
            <ThemedText style={[s.addMemberText, { color: colors.background }]}>Add Song</ThemedText>
          </Pressable>
        </View>
      )}

      {/* Songs by category */}
      {CATEGORIES_ORDERED.map((category) => {
        const songs = SONG_LIBRARY.filter((sl) => sl.category === category);
        if (songs.length === 0) return null;

        return (
          <View key={category} style={s.moduleContainer}>
            <SectionHeader title={category.toUpperCase()} colors={colors} count={songs.length} />
            <Card colors={colors}>
              {songs.map((song, idx) => (
                <Pressable
                  key={song.id}
                  style={[
                    s.librarySongRow,
                    idx < songs.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <View style={[s.librarySongIcon, { backgroundColor: CATEGORY_COLOR[category] + '20' }]}>
                    <IconSymbol name="music.note" size={14} color={CATEGORY_COLOR[category]} />
                  </View>
                  <View style={s.librarySongInfo}>
                    <ThemedText style={[s.librarySongTitle, { color: colors.text }]} numberOfLines={1}>
                      {song.title}
                    </ThemedText>
                    <ThemedText style={[s.librarySongArtist, { color: colors.textSecondary }]} numberOfLines={1}>
                      {song.artist}
                    </ThemedText>
                    <View style={s.librarySongMetaRow}>
                      <ThemedText style={[s.librarySongKeys, { color: colors.textTertiary }]}>
                        Keys: {song.keyOptions.join(', ')}
                      </ThemedText>
                      <ThemedText style={[s.librarySongLastPlayed, { color: colors.textTertiary }]}>
                        Last: {song.lastPlayed}
                      </ThemedText>
                    </View>
                    {(song.hasCharts || song.hasLyrics || song.hasStems) && (
                      <View style={s.libraryAssetRow}>
                        {song.hasCharts && (
                          <View style={[s.libraryAssetBadge, { backgroundColor: '#1D9BF020' }]}>
                            <ThemedText style={[s.libraryAssetText, { color: '#1D9BF0' }]}>Charts</ThemedText>
                          </View>
                        )}
                        {song.hasLyrics && (
                          <View style={[s.libraryAssetBadge, { backgroundColor: '#22C55E20' }]}>
                            <ThemedText style={[s.libraryAssetText, { color: '#22C55E' }]}>Lyrics</ThemedText>
                          </View>
                        )}
                        {song.hasStems && (
                          <View style={[s.libraryAssetBadge, { backgroundColor: '#1D9BF020' }]}>
                            <ThemedText style={[s.libraryAssetText, { color: '#1D9BF0' }]}>Stems</ThemedText>
                          </View>
                        )}
                      </View>
                    )}
                    {song.arrangementNotes && (
                      <ThemedText style={[s.libraryArrangement, { color: colors.textTertiary }]} numberOfLines={1}>
                        {song.arrangementNotes}
                      </ThemedText>
                    )}
                    {isElderLevel(role) && (
                      <View style={s.librarySongAnalytics}>
                        <ThemedText style={[s.librarySongPlays, { color: colors.textTertiary }]}>
                          {song.timesPlayed} plays
                        </ThemedText>
                        <View style={s.libraryRatingRow}>
                          <IconSymbol name="star.fill" size={10} color="#F59E0B" />
                          <ThemedText style={[s.librarySongRating, { color: '#F59E0B' }]}>
                            {song.avgRating.toFixed(1)}
                          </ThemedText>
                        </View>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
            </Card>
          </View>
        );
      })}

      {/* Usage Analytics (C1/C2 only) */}
      {isElderLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="USAGE ANALYTICS" colors={colors} />
          <Card colors={colors}>
            <View style={s.analyticsRow}>
              <ThemedText style={[s.analyticsLabel, { color: colors.textSecondary }]}>Most Played</ThemedText>
              <ThemedText style={[s.analyticsValue, { color: colors.text }]}>
                {[...SONG_LIBRARY].sort((a, b) => b.timesPlayed - a.timesPlayed)[0].title} ({[...SONG_LIBRARY].sort((a, b) => b.timesPlayed - a.timesPlayed)[0].timesPlayed}x)
              </ThemedText>
            </View>
            <View style={[s.analyticsRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <ThemedText style={[s.analyticsLabel, { color: colors.textSecondary }]}>Highest Rated</ThemedText>
              <ThemedText style={[s.analyticsValue, { color: colors.text }]}>
                {[...SONG_LIBRARY].sort((a, b) => b.avgRating - a.avgRating)[0].title} ({[...SONG_LIBRARY].sort((a, b) => b.avgRating - a.avgRating)[0].avgRating.toFixed(1)})
              </ThemedText>
            </View>
            <View style={[s.analyticsRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <ThemedText style={[s.analyticsLabel, { color: colors.textSecondary }]}>Least Played (Active)</ThemedText>
              <ThemedText style={[s.analyticsValue, { color: colors.text }]}>
                {[...SONG_LIBRARY].sort((a, b) => a.timesPlayed - b.timesPlayed)[0].title} ({[...SONG_LIBRARY].sort((a, b) => a.timesPlayed - b.timesPlayed)[0].timesPlayed}x)
              </ThemedText>
            </View>
            <View style={[s.analyticsRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <ThemedText style={[s.analyticsLabel, { color: colors.textSecondary }]}>Songs by Category</ThemedText>
              <ThemedText style={[s.analyticsValue, { color: colors.text }]}>
                {CATEGORIES_ORDERED.map((cat) => `${cat}: ${SONG_LIBRARY.filter((sl) => sl.category === cat).length}`).join(', ')}
              </ThemedText>
            </View>
          </Card>
        </View>
      )}
    </>
  );
}

// =============================================================================
// PILL TOGGLE
// =============================================================================

function ViewToggle({
  views,
  active,
  onSelect,
  colors,
}: {
  views: ViewDef[];
  active: WorshipView;
  onSelect: (v: WorshipView) => void;
  colors: typeof Colors.light;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.toggleRow}
      style={s.toggleScroll}
    >
      {views.map((v) => {
        const isActive = v.id === active;
        return (
          <Pressable
            key={v.id}
            style={[
              s.togglePill,
              {
                backgroundColor: isActive ? colors.text : 'transparent',
                borderColor: isActive ? colors.text : colors.border,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(v.id);
            }}
          >
            <ThemedText
              style={[
                s.togglePillText,
                { color: isActive ? colors.background : colors.textSecondary },
              ]}
            >
              {v.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChurchWorship({ colors, role = 'C1', onSwitchTab }: Props) {
  const visibleViews = getAvailableViews(role);
  const [activeView, setActiveView] = useState<WorshipView>(visibleViews[0]?.id ?? 'sets');

  // Ensure active view is valid for current role
  const safeView = visibleViews.find((v) => v.id === activeView) ? activeView : visibleViews[0]?.id ?? 'sets';

  function renderView() {
    switch (safeView) {
      case 'sets':
        return <SetsView colors={colors} role={role} />;
      case 'rehearsals':
        return <RehearsalsView colors={colors} role={role} />;
      case 'team':
        return <TeamView colors={colors} role={role} />;
      case 'library':
        return <LibraryView colors={colors} role={role} />;
      default:
        return <SetsView colors={colors} role={role} />;
    }
  }

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {visibleViews.length > 1 && (
        <ViewToggle
          views={visibleViews}
          active={safeView}
          onSelect={setActiveView}
          colors={colors}
        />
      )}
      {renderView()}
      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  moduleContainer: { marginBottom: Spacing.lg },
  bottomSpacer: { height: 120 },

  // Toggle
  toggleScroll: { marginBottom: Spacing.md },
  toggleRow: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2, paddingHorizontal: 2 },
  togglePill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  togglePillText: { fontSize: 12, fontWeight: '600' },

  // KPI row
  kpiRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },

  // ---- Sets View ----
  setReadinessRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  setReadinessLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, width: 60 },
  setReadinessTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  setReadinessFill: { height: '100%', borderRadius: 3 },
  setReadinessValue: { fontSize: 12, fontWeight: '800', width: 36, textAlign: 'right' },
  transitionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingLeft: 20 },
  transitionText: { fontSize: 10, fontStyle: 'italic' },
  auditTrailContainer: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ffffff10' },
  auditTrailLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  auditRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  auditDot: { width: 4, height: 4, borderRadius: 2 },
  auditText: { fontSize: 10 },
  setHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.sm },
  setHeaderLeft: { flex: 1, marginRight: Spacing.sm },
  setDate: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  setMeta: { fontSize: 12, marginBottom: 2 },
  setLeader: { fontSize: 11 },
  setStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  setStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  songList: { marginTop: 4 },
  songRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  songNumber: { width: 20, alignItems: 'center' },
  songNumberText: { fontSize: 11, fontWeight: '600' },
  songInfo: { flex: 1 },
  songTitle: { fontSize: 13, fontWeight: '600', marginBottom: 1 },
  songArtist: { fontSize: 11, marginBottom: 1 },
  songArrangement: { fontSize: 10, fontStyle: 'italic' },
  songDetails: { alignItems: 'flex-end', gap: 2 },
  songKeyBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm, minWidth: 26, alignItems: 'center' },
  songKeyText: { fontSize: 11, fontWeight: '700' },
  songTempo: { fontSize: 10 },
  songDuration: { fontSize: 10 },
  setNotesContainer: { marginTop: Spacing.sm, padding: Spacing.sm, borderRadius: BorderRadius.sm, gap: 2 },
  setNotesLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  setNotesText: { fontSize: 12, lineHeight: 17 },
  approveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: Spacing.sm, paddingVertical: 10, borderRadius: BorderRadius.md },
  approveButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // ---- Rehearsals View ----
  rehearsalHeader: { flexDirection: 'row', marginBottom: Spacing.sm },
  rehearsalHeaderLeft: { flex: 1 },
  rehearsalDate: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  rehearsalType: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  rehearsalTimeLoc: { fontSize: 11, marginBottom: 1 },
  rehearsalLeader: { fontSize: 11 },
  rehearsalRSVPSummary: { alignItems: 'flex-end', gap: 3 },
  rsvpSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rsvpDot: { width: 6, height: 6, borderRadius: 3 },
  rsvpCount: { fontSize: 12, fontWeight: '600' },
  rehearsalSongsContainer: { marginBottom: Spacing.sm },
  rehearsalSongsLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  rehearsalSongTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  rehearsalSongTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm },
  rehearsalSongTagText: { fontSize: 11, fontWeight: '500' },
  actionItemsContainer: { marginBottom: Spacing.sm },
  actionItemsLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  actionItemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 4 },
  actionItemText: { fontSize: 11, flex: 1 },
  rehearsalAttendeesContainer: { marginTop: 4 },
  rehearsalAttendeesLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  attendeeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  attendeeAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  attendeeInitials: { fontSize: 11, fontWeight: '700' },
  attendeeInfo: { flex: 1 },
  attendeeName: { fontSize: 13, fontWeight: '600', marginBottom: 1 },
  attendeeRole: { fontSize: 11 },
  rsvpBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  rsvpBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // ---- Coverage Grid ----
  coverageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
  coverageCell: { width: '31%', paddingVertical: 6, paddingHorizontal: 8, borderRadius: BorderRadius.sm, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  coverageRole: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 2 },
  coverageName: { fontSize: 11, fontWeight: '600' },
  coverageSummaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  coverageSummaryText: { fontSize: 11, fontWeight: '500' },

  // ---- Team View ----
  teamMemberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  teamAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  teamAvatarText: { fontSize: 12, fontWeight: '700' },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  teamRoles: { fontSize: 12, marginBottom: 1 },
  teamAvailability: { fontSize: 11 },
  teamExtraRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  skillBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: BorderRadius.sm },
  skillBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  teamSince: { fontSize: 10 },
  teamStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  teamStatusDot: { width: 5, height: 5, borderRadius: 2.5 },
  teamStatusText: { fontSize: 9, fontWeight: '600' },
  addMemberButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: BorderRadius.md },
  addMemberText: { fontSize: 13, fontWeight: '700' },
  rotationRow: { paddingVertical: 10 },
  rotationLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  rotationValue: { fontSize: 12, lineHeight: 17 },

  // ---- Library View ----
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth },
  searchPlaceholder: { fontSize: 14 },
  librarySongRow: { flexDirection: 'row', paddingVertical: 10, gap: 10 },
  librarySongIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  librarySongInfo: { flex: 1 },
  librarySongTitle: { fontSize: 14, fontWeight: '600', marginBottom: 1 },
  librarySongArtist: { fontSize: 12, marginBottom: 2 },
  librarySongMetaRow: { flexDirection: 'row', gap: 12 },
  librarySongKeys: { fontSize: 10 },
  librarySongLastPlayed: { fontSize: 10 },
  libraryAssetRow: { flexDirection: 'row', gap: 4, marginTop: 3 },
  libraryAssetBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: BorderRadius.sm },
  libraryAssetText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  libraryArrangement: { fontSize: 10, fontStyle: 'italic', marginTop: 2 },
  librarySongAnalytics: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 3 },
  librarySongPlays: { fontSize: 10 },
  libraryRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  librarySongRating: { fontSize: 10, fontWeight: '600' },
  analyticsRow: { paddingVertical: 10 },
  analyticsLabel: { fontSize: 12, fontWeight: '600', marginBottom: 3 },
  analyticsValue: { fontSize: 12, lineHeight: 17 },
});
