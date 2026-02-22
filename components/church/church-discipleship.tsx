/**
 * Church Discipleship — 5-view pill-toggled discipleship tab.
 * Views: My Path | Pathways | Groups | Resources | Leader Tools
 * RBAC:
 *   C1/C2 — All 5 views (full discipleship management + leader tools)
 *   C3    — My Path, Pathways, Groups, Resources (staff — manage groups & resources)
 *   C4    — My Path, Pathways, Groups, Resources (member — personal growth)
 *   C5    — Pathways only (explore what the church offers)
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { ChurchRoleLens } from '@/utils/church-rbac';
import {
  isElderLevel,
  isStaffLevel,
  isMember,
} from '@/utils/church-rbac';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: ChurchRoleLens;
  onSwitchTab?: (index: number) => void;
}

type DiscipleshipView = 'my-path' | 'pathways' | 'groups' | 'resources' | 'leader-tools';

interface ViewOption {
  id: DiscipleshipView;
  label: string;
}

// =============================================================================
// VIEW CONFIG — RBAC-filtered
// =============================================================================

const ALL_VIEWS: ViewOption[] = [
  { id: 'my-path', label: 'My Path' },
  { id: 'pathways', label: 'Pathways' },
  { id: 'groups', label: 'Groups' },
  { id: 'resources', label: 'Resources' },
  { id: 'leader-tools', label: 'Leader Tools' },
];

function getAvailableViews(role: ChurchRoleLens): ViewOption[] {
  if (role === 'C5') return ALL_VIEWS.filter((v) => v.id === 'pathways');
  if (role === 'C4' || role === 'C3') return ALL_VIEWS.filter((v) => v.id !== 'leader-tools');
  // C1, C2 — all 5 views
  return ALL_VIEWS;
}

function getDefaultView(role: ChurchRoleLens): DiscipleshipView {
  if (role === 'C5') return 'pathways';
  if (role === 'C1' || role === 'C2') return 'my-path';
  return 'my-path';
}

// =============================================================================
// INLINE MOCK DATA — MY PATH
// =============================================================================

interface PathwayProgress {
  id: string;
  name: string;
  currentStep: number;
  totalSteps: number;
  nextMilestone: string;
  progress: number;
}

const MY_PATHWAY_PROGRESS: PathwayProgress = {
  id: 'pp-1',
  name: 'Bible Overview',
  currentStep: 8,
  totalSteps: 12,
  nextMilestone: 'Complete Wisdom Literature Module',
  progress: 67,
};

interface ActiveStudy {
  id: string;
  title: string;
  leader: string;
  dayTime: string;
  progress: number;
  nextSession: string;
}

const MY_ACTIVE_STUDIES: ActiveStudy[] = [
  { id: 'as-1', title: 'Old Testament Survey', leader: 'Elder Thompson', dayTime: 'Wed 7:00 PM', progress: 68, nextSession: 'Feb 19' },
  { id: 'as-2', title: 'Men\'s Accountability Group', leader: 'Brother Jackson', dayTime: 'Sat 8:00 AM', progress: 40, nextSession: 'Feb 22' },
  { id: 'as-3', title: 'Prayer & Fasting Foundations', leader: 'Mother Johnson', dayTime: 'Mon 6:30 PM', progress: 25, nextSession: 'Feb 24' },
];

interface SpiritualHabit {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
}

const SPIRITUAL_HABITS: SpiritualHabit[] = [
  { id: 'sh-1', label: 'Bible Reading Streak', value: '14 days', icon: 'book.fill', color: '#1D9BF0' },
  { id: 'sh-2', label: 'Prayer Journal', value: '8 entries this month', icon: 'hands.sparkles.fill', color: '#1D9BF0' },
  { id: 'sh-3', label: 'Scripture Memory', value: '3 verses', icon: 'text.book.closed.fill', color: '#22C55E' },
  { id: 'sh-4', label: 'Service Hours', value: '6h this month', icon: 'heart.fill', color: '#F59E0B' },
];

interface GrowthMilestone {
  id: string;
  label: string;
  completed: boolean;
}

const GROWTH_MILESTONES: GrowthMilestone[] = [
  { id: 'gm-1', label: 'Completed Foundations Class', completed: true },
  { id: 'gm-2', label: 'Baptized', completed: true },
  { id: 'gm-3', label: 'Joined Small Group', completed: true },
  { id: 'gm-4', label: 'Started Serving', completed: true },
  { id: 'gm-5', label: 'Completed Bible Overview', completed: false },
];

interface NextStepRec {
  title: string;
  description: string;
  cta: string;
}

const NEXT_STEP: NextStepRec = {
  title: 'Join a Mentoring Pair',
  description: 'You\'ve completed the foundations and are growing steadily. Consider being paired with a mature believer for one-on-one discipleship.',
  cta: 'Explore Mentoring',
};

// 6-stage meta-journey model
type JourneyStage = 'explore' | 'foundations' | 'practices' | 'community' | 'serve' | 'lead';

interface JourneyStageInfo {
  id: JourneyStage;
  label: string;
  icon: string;
  color: string;
}

const JOURNEY_STAGES: JourneyStageInfo[] = [
  { id: 'explore', label: 'Explore', icon: 'magnifyingglass', color: '#A1A1AA' },
  { id: 'foundations', label: 'Foundations', icon: 'book.fill', color: '#1D9BF0' },
  { id: 'practices', label: 'Practices', icon: 'hands.sparkles.fill', color: '#1D9BF0' },
  { id: 'community', label: 'Community', icon: 'person.2.fill', color: '#22C55E' },
  { id: 'serve', label: 'Serve', icon: 'heart.fill', color: '#F59E0B' },
  { id: 'lead', label: 'Lead', icon: 'star.fill', color: '#1D9BF0' },
];

// Derived from milestones: completed Foundations + Joined Group + Started Serving = stage 4 (serve)
const CURRENT_JOURNEY_STAGE: JourneyStage = 'serve';

// =============================================================================
// INLINE MOCK DATA — PATHWAYS
// =============================================================================

type EnrollmentType = 'open' | 'approval' | 'invite-only';

interface DiscipleshipPathway {
  id: string;
  name: string;
  description: string;
  stageCount: number;
  estimatedWeeks: number;
  type: 'foundations' | 'growth' | 'leadership' | 'specialized';
  enrolledCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  stages: string[];
  enrollmentType: EnrollmentType;
}

const ENROLLMENT_TYPE_LABELS: Record<EnrollmentType, string> = {
  open: 'Open Enrollment',
  approval: 'Approval Required',
  'invite-only': 'Invite Only',
};

const ENROLLMENT_TYPE_COLORS: Record<EnrollmentType, string> = {
  open: '#22C55E',
  approval: '#F59E0B',
  'invite-only': '#1D9BF0',
};

const DISCIPLESHIP_PATHWAYS: DiscipleshipPathway[] = [
  {
    id: 'dp-1',
    name: 'Foundations',
    description: 'Essential first steps for new believers — salvation, baptism, membership, and first serve opportunity.',
    stageCount: 4,
    estimatedWeeks: 8,
    type: 'foundations',
    enrolledCount: 64,
    difficulty: 'beginner',
    stages: ['Salvation', 'Baptism', 'Membership', 'First Serve'],
    enrollmentType: 'open',
  },
  {
    id: 'dp-2',
    name: 'Bible Overview',
    description: 'A comprehensive journey through Scripture covering Old Testament survey, New Testament survey, and theology basics.',
    stageCount: 12,
    estimatedWeeks: 24,
    type: 'growth',
    enrolledCount: 42,
    difficulty: 'intermediate',
    stages: ['Genesis-Deuteronomy', 'Historical Books', 'Wisdom Literature', 'Major Prophets', 'Minor Prophets', 'OT Summary', 'Gospels', 'Acts', 'Pauline Epistles', 'General Epistles', 'Revelation', 'Theology Basics'],
    enrollmentType: 'open',
  },
  {
    id: 'dp-3',
    name: 'Leadership Development',
    description: 'Equipping the next generation of ministry leaders through character formation, gifting discovery, and practical leadership training.',
    stageCount: 6,
    estimatedWeeks: 16,
    type: 'leadership',
    enrolledCount: 18,
    difficulty: 'advanced',
    stages: ['Character', 'Gifting Discovery', 'Small Group Leader', 'Ministry Leader', 'Conflict Resolution', 'Vision Casting'],
    enrollmentType: 'approval',
  },
  {
    id: 'dp-4',
    name: 'Marriage Enrichment',
    description: 'Biblical principles for building and sustaining a Christ-centered marriage across every season of life.',
    stageCount: 5,
    estimatedWeeks: 10,
    type: 'specialized',
    enrolledCount: 28,
    difficulty: 'beginner',
    stages: ['Communication', 'Finances', 'Intimacy', 'Parenting', 'Legacy'],
    enrollmentType: 'open',
  },
  {
    id: 'dp-5',
    name: 'Prayer & Fasting',
    description: 'Deepening your prayer life from foundational practices to intercessory prayer, spiritual warfare, and fasting disciplines.',
    stageCount: 4,
    estimatedWeeks: 4,
    type: 'growth',
    enrolledCount: 36,
    difficulty: 'beginner',
    stages: ['Intro to Prayer', 'Intercessory Prayer', 'Spiritual Warfare', 'Fasting'],
    enrollmentType: 'open',
  },
  {
    id: 'dp-6',
    name: 'Missions Mobilization',
    description: 'Developing a heart for the nations through cross-cultural awareness, short-term preparation, and long-term calling discernment.',
    stageCount: 6,
    estimatedWeeks: 12,
    type: 'specialized',
    enrolledCount: 14,
    difficulty: 'intermediate',
    stages: ['Heart for Nations', 'Cross-Cultural Awareness', 'Short-Term Prep', 'Long-Term Calling', 'Support Raising', 'Field Readiness'],
    enrollmentType: 'invite-only',
  },
];

const PATHWAY_TYPE_COLORS: Record<string, string> = {
  foundations: '#22C55E',
  growth: '#1D9BF0',
  leadership: '#1D9BF0',
  specialized: '#F59E0B',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#22C55E',
  intermediate: '#1D9BF0',
  advanced: '#1D9BF0',
};

// =============================================================================
// INLINE MOCK DATA — GROUPS
// =============================================================================

type GroupJoinType = 'open' | 'request' | 'invite-only';

interface DiscipleshipGroup {
  id: string;
  name: string;
  leader: string;
  topic: string;
  dayTime: string;
  location: string;
  currentMembers: number;
  capacity: number;
  type: 'Bible Study' | 'Book Study' | 'Mentoring' | 'Accountability' | 'Discussion';
  joinType: GroupJoinType;
  avgAttendance: number;
  engagementScore: number;
}

const JOIN_TYPE_LABELS: Record<GroupJoinType, string> = {
  open: 'OPEN',
  request: 'REQUEST',
  'invite-only': 'INVITE ONLY',
};

const JOIN_TYPE_COLORS: Record<GroupJoinType, string> = {
  open: '#22C55E',
  request: '#F59E0B',
  'invite-only': '#1D9BF0',
};

const DISCIPLESHIP_GROUPS: DiscipleshipGroup[] = [
  { id: 'dg-1', name: 'Men of Valor', leader: 'Elder Thompson', topic: 'Spiritual Leadership', dayTime: 'Tue 6:30 AM', location: 'Downtown - Room 105', currentMembers: 8, capacity: 12, type: 'Accountability', joinType: 'open', avgAttendance: 88, engagementScore: 92 },
  { id: 'dg-2', name: 'Women of Purpose', leader: 'Deaconess Mitchell', topic: 'Proverbs 31 Study', dayTime: 'Wed 10:00 AM', location: 'Downtown - Room 201', currentMembers: 14, capacity: 16, type: 'Bible Study', joinType: 'open', avgAttendance: 82, engagementScore: 88 },
  { id: 'dg-3', name: 'Young Adults Connect', leader: 'Pastor Marcus', topic: 'Faith in the Real World', dayTime: 'Thu 7:00 PM', location: 'Westside - Lounge', currentMembers: 20, capacity: 25, type: 'Discussion', joinType: 'open', avgAttendance: 76, engagementScore: 84 },
  { id: 'dg-4', name: 'Couples Journey', leader: 'Pastor & Mrs. Williams', topic: 'Marriage God\'s Way', dayTime: 'Fri 7:00 PM', location: 'Downtown - Room 110', currentMembers: 14, capacity: 14, type: 'Book Study', joinType: 'request', avgAttendance: 90, engagementScore: 94 },
  { id: 'dg-5', name: 'New Believers Circle', leader: 'Deacon Park', topic: 'Foundations of Faith', dayTime: 'Sun 12:15 PM', location: 'Downtown - Room 102', currentMembers: 10, capacity: 15, type: 'Bible Study', joinType: 'open', avgAttendance: 72, engagementScore: 78 },
  { id: 'dg-6', name: 'Intercessory Prayer Team', leader: 'Mother Johnson', topic: 'Strategic Prayer', dayTime: 'Mon 6:30 PM', location: 'Downtown - Prayer Room', currentMembers: 8, capacity: 12, type: 'Accountability', joinType: 'request', avgAttendance: 94, engagementScore: 96 },
  { id: 'dg-7', name: 'Theology Deep Dive', leader: 'Dr. Chen', topic: 'Systematic Theology', dayTime: 'Sat 9:00 AM', location: 'Downtown - Library', currentMembers: 6, capacity: 8, type: 'Discussion', joinType: 'invite-only', avgAttendance: 86, engagementScore: 90 },
  { id: 'dg-8', name: 'Grief & Hope', leader: 'Sister Ramirez', topic: 'Walking Through Loss', dayTime: 'Wed 6:30 PM', location: 'South Bay - Room B', currentMembers: 5, capacity: 10, type: 'Book Study', joinType: 'open', avgAttendance: 80, engagementScore: 85 },
  { id: 'dg-9', name: 'Leadership Pipeline', leader: 'Pastor David Chen', topic: 'Next-Gen Leaders', dayTime: 'Sat 10:00 AM', location: 'Downtown - Board Room', currentMembers: 12, capacity: 15, type: 'Mentoring', joinType: 'request', avgAttendance: 88, engagementScore: 92 },
  { id: 'dg-10', name: 'Spanish Bible Study', leader: 'Hermano Rodriguez', topic: 'Estudio del Evangelio de Juan', dayTime: 'Thu 7:00 PM', location: 'South Bay - Room A', currentMembers: 11, capacity: 15, type: 'Bible Study', joinType: 'open', avgAttendance: 78, engagementScore: 82 },
  { id: 'dg-11', name: 'Financial Stewardship', leader: 'Deacon Williams', topic: 'Managing God\'s Resources', dayTime: 'Tue 7:00 PM', location: 'Westside - Room 103', currentMembers: 9, capacity: 12, type: 'Book Study', joinType: 'open', avgAttendance: 74, engagementScore: 80 },
  { id: 'dg-12', name: 'Missions Heart', leader: 'Brother Okafor', topic: 'Global Outreach Prep', dayTime: 'Sat 8:00 AM', location: 'Downtown - Room 205', currentMembers: 7, capacity: 10, type: 'Mentoring', joinType: 'invite-only', avgAttendance: 70, engagementScore: 76 },
];

const GROUP_TYPE_COLORS: Record<string, string> = {
  'Bible Study': '#1D9BF0',
  'Book Study': '#1D9BF0',
  'Mentoring': '#22C55E',
  'Accountability': '#F59E0B',
  'Discussion': '#1D9BF0',
};

// =============================================================================
// INLINE MOCK DATA — RESOURCES
// =============================================================================

type AudienceScope = 'all' | 'leaders' | 'pathway-specific';

interface DiscipleshipResource {
  id: string;
  title: string;
  author: string;
  type: 'Book' | 'Video Series' | 'Study Guide' | 'Devotional' | 'Worksheet' | 'External Link';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  recommendedFor: string;
  featured: boolean;
  audienceScope: AudienceScope;
  topicTags: string[];
}

const DISCIPLESHIP_RESOURCES: DiscipleshipResource[] = [
  { id: 'dr-1', title: 'Mere Christianity', author: 'C.S. Lewis', type: 'Book', description: 'A classic exploration of the rational basis for Christianity and core Christian beliefs.', difficulty: 'beginner', recommendedFor: 'Foundations Pathway', featured: true, audienceScope: 'all', topicTags: ['Apologetics', 'Faith', 'Theology'] },
  { id: 'dr-2', title: 'Experiencing God', author: 'Henry Blackaby', type: 'Study Guide', description: 'Knowing and doing the will of God. A foundational study on hearing from God and joining His work.', difficulty: 'beginner', recommendedFor: 'Foundations Pathway', featured: false, audienceScope: 'all', topicTags: ['Discipleship', 'Prayer', 'Obedience'] },
  { id: 'dr-3', title: 'The Bible Project', author: 'Tim Mackie & Jon Collins', type: 'Video Series', description: 'Animated videos explaining every book of the Bible, themes, and theological concepts.', difficulty: 'beginner', recommendedFor: 'Bible Overview Pathway', featured: true, audienceScope: 'all', topicTags: ['Bible', 'Theology', 'Overview'] },
  { id: 'dr-4', title: 'RightNow Media', author: 'Various', type: 'External Link', description: 'The Netflix of Bible study. Free access for church members to thousands of video studies.', difficulty: 'beginner', recommendedFor: 'All Members', featured: false, audienceScope: 'all', topicTags: ['Bible Study', 'Video', 'Library'] },
  { id: 'dr-5', title: 'Spiritual Disciplines Handbook', author: 'Adele Calhoun', type: 'Book', description: 'Practices that transform us. A comprehensive guide to over 60 spiritual disciplines.', difficulty: 'intermediate', recommendedFor: 'Growth Pathway', featured: false, audienceScope: 'all', topicTags: ['Spiritual Disciplines', 'Growth', 'Practices'] },
  { id: 'dr-6', title: 'Foundations Study Guide', author: 'Church Staff', type: 'Study Guide', description: 'Our church\'s official 12-week foundations curriculum for new believers and new members.', difficulty: 'beginner', recommendedFor: 'Foundations Pathway', featured: false, audienceScope: 'pathway-specific', topicTags: ['New Believer', 'Foundations', 'Membership'] },
  { id: 'dr-7', title: 'Jesus and the Gospels', author: 'Craig Blomberg', type: 'Book', description: 'An introduction to the four Gospels and the life and teaching of Jesus Christ.', difficulty: 'intermediate', recommendedFor: 'Bible Overview Pathway', featured: false, audienceScope: 'all', topicTags: ['Gospels', 'Jesus', 'Bible'] },
  { id: 'dr-8', title: 'Prayer Journal Template', author: 'Church Staff', type: 'Worksheet', description: 'Printable daily prayer journal with ACTS framework (Adoration, Confession, Thanksgiving, Supplication).', difficulty: 'beginner', recommendedFor: 'Prayer & Fasting Pathway', featured: false, audienceScope: 'all', topicTags: ['Prayer', 'Journal', 'Spiritual Disciplines'] },
  { id: 'dr-9', title: 'Celebration of Discipline', author: 'Richard Foster', type: 'Book', description: 'The path to spiritual growth through inward, outward, and corporate disciplines.', difficulty: 'intermediate', recommendedFor: 'Growth Pathway', featured: false, audienceScope: 'all', topicTags: ['Spiritual Disciplines', 'Growth', 'Classic'] },
  { id: 'dr-10', title: 'Leadership Development Workbook', author: 'Church Staff', type: 'Worksheet', description: 'Self-assessment and development plan for emerging ministry leaders.', difficulty: 'advanced', recommendedFor: 'Leadership Pathway', featured: false, audienceScope: 'leaders', topicTags: ['Leadership', 'Assessment', 'Development'] },
  { id: 'dr-11', title: 'Daily Devotional: Walking with Jesus', author: 'Church Staff', type: 'Devotional', description: '365-day devotional with daily Scripture reading, reflection questions, and prayer prompts.', difficulty: 'beginner', recommendedFor: 'All Members', featured: false, audienceScope: 'all', topicTags: ['Devotional', 'Daily Reading', 'Prayer'] },
  { id: 'dr-12', title: 'Marriage Enrichment Workbook', author: 'Pastor & Mrs. Williams', type: 'Worksheet', description: 'Companion workbook for the Marriage Enrichment pathway with discussion guides and exercises.', difficulty: 'beginner', recommendedFor: 'Marriage Pathway', featured: false, audienceScope: 'pathway-specific', topicTags: ['Marriage', 'Family', 'Communication'] },
  { id: 'dr-13', title: 'Knowing God', author: 'J.I. Packer', type: 'Book', description: 'A deep exploration of the character and attributes of God. A theological classic.', difficulty: 'intermediate', recommendedFor: 'Bible Overview Pathway', featured: false, audienceScope: 'all', topicTags: ['Theology', 'God', 'Classic'] },
  { id: 'dr-14', title: 'Missions Prep Guide', author: 'Brother Okafor', type: 'Study Guide', description: 'Cultural awareness, spiritual preparation, and practical logistics for short-term missions.', difficulty: 'intermediate', recommendedFor: 'Missions Pathway', featured: false, audienceScope: 'pathway-specific', topicTags: ['Missions', 'Cross-Cultural', 'Outreach'] },
  { id: 'dr-15', title: 'The Screwtape Letters', author: 'C.S. Lewis', type: 'Book', description: 'A satirical look at spiritual warfare from the perspective of a senior demon.', difficulty: 'beginner', recommendedFor: 'Prayer & Fasting Pathway', featured: false, audienceScope: 'all', topicTags: ['Spiritual Warfare', 'Fiction', 'Classic'] },
  { id: 'dr-16', title: 'Scripture Memory Cards', author: 'Church Staff', type: 'Worksheet', description: 'Printable verse cards organized by topic: faith, prayer, identity, spiritual warfare, love.', difficulty: 'beginner', recommendedFor: 'All Members', featured: false, audienceScope: 'all', topicTags: ['Scripture', 'Memory', 'Printable'] },
  { id: 'dr-17', title: 'Desiring God', author: 'John Piper', type: 'Book', description: 'Christian hedonism and finding ultimate satisfaction in God.', difficulty: 'advanced', recommendedFor: 'Growth Pathway', featured: false, audienceScope: 'all', topicTags: ['Theology', 'Joy', 'Worship'] },
  { id: 'dr-18', title: 'Old Testament Overview', author: 'Church Staff', type: 'Video Series', description: 'Church-produced 12-part video series walking through the major sections and themes of the Old Testament.', difficulty: 'intermediate', recommendedFor: 'Bible Overview Pathway', featured: false, audienceScope: 'pathway-specific', topicTags: ['Old Testament', 'Bible', 'Video'] },
  { id: 'dr-19', title: 'Fasting Guide', author: 'Church Staff', type: 'Study Guide', description: 'Practical guide to different types of fasts: Daniel Fast, water fast, media fast, with spiritual preparation.', difficulty: 'beginner', recommendedFor: 'Prayer & Fasting Pathway', featured: false, audienceScope: 'all', topicTags: ['Fasting', 'Prayer', 'Spiritual Disciplines'] },
  { id: 'dr-20', title: 'YouVersion Bible App', author: 'Life.Church', type: 'External Link', description: 'Free Bible app with reading plans, audio Bible, verse images, and community features.', difficulty: 'beginner', recommendedFor: 'All Members', featured: false, audienceScope: 'all', topicTags: ['Bible', 'App', 'Reading Plans'] },
];

const RESOURCE_TYPE_COLORS: Record<string, string> = {
  'Book': '#1D9BF0',
  'Video Series': '#EF4444',
  'Study Guide': '#22C55E',
  'Devotional': '#1D9BF0',
  'Worksheet': '#F59E0B',
  'External Link': '#1D9BF0',
};

const RESOURCE_CATEGORIES = ['All', 'Book', 'Video Series', 'Study Guide', 'Devotional', 'Worksheet', 'External Link'];

// =============================================================================
// INLINE MOCK DATA — LEADER TOOLS
// =============================================================================

interface LeaderKPI {
  id: string;
  label: string;
  value: string;
  icon: string;
}

const LEADER_KPIS: LeaderKPI[] = [
  { id: 'lk-1', label: 'Active Pathways', value: '6', icon: 'road.lanes' },
  { id: 'lk-2', label: 'Total Enrolled', value: '280', icon: 'person.3.fill' },
  { id: 'lk-3', label: 'Completion Rate', value: '62%', icon: 'checkmark.circle.fill' },
  { id: 'lk-4', label: 'Active Groups', value: '12', icon: 'rectangle.3.group.fill' },
  { id: 'lk-5', label: 'Leaders Trained', value: '34', icon: 'star.fill' },
];

interface PathwayPerformance {
  id: string;
  name: string;
  enrolled: number;
  active: number;
  completed: number;
  dropOffRate: number;
}

const PATHWAY_PERFORMANCE: PathwayPerformance[] = [
  { id: 'pp-1', name: 'Foundations', enrolled: 64, active: 48, completed: 142, dropOffRate: 8 },
  { id: 'pp-2', name: 'Bible Overview', enrolled: 42, active: 38, completed: 56, dropOffRate: 14 },
  { id: 'pp-3', name: 'Leadership Development', enrolled: 18, active: 16, completed: 24, dropOffRate: 12 },
  { id: 'pp-4', name: 'Marriage Enrichment', enrolled: 28, active: 22, completed: 38, dropOffRate: 10 },
  { id: 'pp-5', name: 'Prayer & Fasting', enrolled: 36, active: 32, completed: 84, dropOffRate: 6 },
  { id: 'pp-6', name: 'Missions Mobilization', enrolled: 14, active: 12, completed: 18, dropOffRate: 16 },
];

interface LeaderPipelineItem {
  id: string;
  name: string;
  status: 'in-training' | 'ready' | 'leading';
  ministry: string;
  completedModules: number;
  totalModules: number;
}

const LEADER_PIPELINE: LeaderPipelineItem[] = [
  { id: 'lp-1', name: 'Brother Davis', status: 'in-training', ministry: 'Small Groups', completedModules: 4, totalModules: 6 },
  { id: 'lp-2', name: 'Sister Garcia', status: 'in-training', ministry: 'Youth', completedModules: 2, totalModules: 6 },
  { id: 'lp-3', name: 'Deacon Kim', status: 'ready', ministry: 'Worship', completedModules: 6, totalModules: 6 },
  { id: 'lp-4', name: 'Brother Okafor', status: 'leading', ministry: 'Missions', completedModules: 6, totalModules: 6 },
  { id: 'lp-5', name: 'Sister Nguyen', status: 'ready', ministry: 'Children', completedModules: 6, totalModules: 6 },
  { id: 'lp-6', name: 'Brother Martinez', status: 'in-training', ministry: 'Outreach', completedModules: 3, totalModules: 6 },
  { id: 'lp-7', name: 'Sister Brown', status: 'leading', ministry: 'Prayer', completedModules: 6, totalModules: 6 },
  { id: 'lp-8', name: 'Deacon Williams', status: 'leading', ministry: 'Finance', completedModules: 6, totalModules: 6 },
];

const PIPELINE_STATUS_COLORS: Record<string, string> = {
  'in-training': '#F59E0B',
  'ready': '#1D9BF0',
  'leading': '#22C55E',
};

// Placement Queue — unplaced members
interface UnplacedMember {
  id: string;
  name: string;
  joinedDate: string;
  interests: string[];
  status: 'awaiting' | 'contacted' | 'placed';
}

const UNPLACED_MEMBERS: UnplacedMember[] = [
  { id: 'um-1', name: 'Hannah Davis', joinedDate: 'Jan 2026', interests: ['Bible Study', 'Women\'s Ministry'], status: 'awaiting' },
  { id: 'um-2', name: 'Chris Adams', joinedDate: 'Jan 2026', interests: ['Men\'s Group', 'Service'], status: 'contacted' },
  { id: 'um-3', name: 'Jasmine Wright', joinedDate: 'Feb 2026', interests: ['Worship', 'Young Adults'], status: 'awaiting' },
  { id: 'um-4', name: 'Daniel Okafor', joinedDate: 'Feb 2026', interests: ['Missions', 'Prayer'], status: 'awaiting' },
];

// At-Risk — disengaging members
interface AtRiskMember {
  id: string;
  name: string;
  pathway: string;
  lastActivity: string;
  daysInactive: number;
  riskLevel: 'warning' | 'critical';
}

const AT_RISK_MEMBERS: AtRiskMember[] = [
  { id: 'ar-1', name: 'Patricia Evans', pathway: 'Bible Overview', lastActivity: 'Dec 14, 2025', daysInactive: 66, riskLevel: 'critical' },
  { id: 'ar-2', name: 'Daniel Wright', pathway: 'Foundations', lastActivity: 'Nov 10, 2025', daysInactive: 100, riskLevel: 'critical' },
  { id: 'ar-3', name: 'Kevin Brooks', pathway: 'Prayer & Fasting', lastActivity: 'Feb 2, 2026', daysInactive: 16, riskLevel: 'warning' },
  { id: 'ar-4', name: 'Nicole Foster', pathway: 'Marriage Enrichment', lastActivity: 'Jan 26, 2026', daysInactive: 23, riskLevel: 'warning' },
];

// Cohort Management
interface Cohort {
  id: string;
  name: string;
  pathway: string;
  startDate: string;
  endDate: string;
  enrolled: number;
  status: 'active' | 'upcoming' | 'completed';
}

const COHORTS: Cohort[] = [
  { id: 'co-1', name: 'Foundations Spring 2026', pathway: 'Foundations', startDate: 'Mar 1, 2026', endDate: 'Apr 26, 2026', enrolled: 22, status: 'upcoming' },
  { id: 'co-2', name: 'Bible Overview Q1 2026', pathway: 'Bible Overview', startDate: 'Jan 12, 2026', endDate: 'Jun 28, 2026', enrolled: 18, status: 'active' },
  { id: 'co-3', name: 'Leadership Dev Cohort 3', pathway: 'Leadership Development', startDate: 'Feb 1, 2026', endDate: 'May 24, 2026', enrolled: 8, status: 'active' },
  { id: 'co-4', name: 'Foundations Winter 2025', pathway: 'Foundations', startDate: 'Oct 6, 2025', endDate: 'Dec 14, 2025', enrolled: 28, status: 'completed' },
];

const COHORT_STATUS_COLORS: Record<string, string> = {
  active: '#1D9BF0',
  upcoming: '#F59E0B',
  completed: '#22C55E',
};

interface GrowthTrend {
  id: string;
  month: string;
  newEnrollments: number;
  completions: number;
  engagement: number;
}

const GROWTH_TRENDS: GrowthTrend[] = [
  { id: 'gt-1', month: 'Sep 2025', newEnrollments: 34, completions: 18, engagement: 78 },
  { id: 'gt-2', month: 'Oct 2025', newEnrollments: 28, completions: 22, engagement: 80 },
  { id: 'gt-3', month: 'Nov 2025', newEnrollments: 22, completions: 16, engagement: 76 },
  { id: 'gt-4', month: 'Dec 2025', newEnrollments: 18, completions: 14, engagement: 72 },
  { id: 'gt-5', month: 'Jan 2026', newEnrollments: 46, completions: 20, engagement: 82 },
  { id: 'gt-6', month: 'Feb 2026', newEnrollments: 38, completions: 24, engagement: 84 },
];

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors, count, action }: { title: string; colors: typeof Colors.light; count?: number; action?: string }) {
  return (
    <View style={sh.headerRow}>
      <ThemedText style={[sh.sectionLabel, { color: colors.textSecondary }]}>
        {title}
      </ThemedText>
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

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'active' || status === 'completed' || status === 'open' || status === 'leading' ? '#22C55E' :
    status === 'ready' || status === 'in-progress' ? '#1D9BF0' :
    status === 'in-training' || status === 'paused' || status === 'closed' ? '#F59E0B' :
    '#A1A1AA';
  return <View style={[sh.statusDot, { backgroundColor: color }]} />;
}

const sh = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionBtn: {
    marginLeft: 'auto',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

// =============================================================================
// VIEW: MY PATH
// =============================================================================

function MyPathView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const stageIdx = JOURNEY_STAGES.findIndex((s) => s.id === CURRENT_JOURNEY_STAGE);

  return (
    <>
      {/* 6-Stage Journey Strip */}
      <View style={s.moduleContainer}>
        <SectionHeader title="YOUR DISCIPLESHIP JOURNEY" colors={colors} />
        <Card colors={colors}>
          <View style={s.journeyStrip}>
            {JOURNEY_STAGES.map((stage, idx) => {
              const isCompleted = idx < stageIdx;
              const isCurrent = idx === stageIdx;
              const isFuture = idx > stageIdx;
              const dotColor = isCompleted ? '#22C55E' : isCurrent ? stage.color : colors.backgroundTertiary;
              const labelColor = isCompleted ? '#22C55E' : isCurrent ? stage.color : colors.textTertiary;

              return (
                <React.Fragment key={stage.id}>
                  <View style={s.journeyStageWrap}>
                    <View style={[
                      s.journeyDot,
                      { backgroundColor: dotColor, borderColor: isCurrent ? stage.color : 'transparent' },
                      isCurrent && s.journeyDotCurrent,
                    ]}>
                      {isCompleted && <IconSymbol name="checkmark" size={8} color="#FFFFFF" />}
                      {isCurrent && <IconSymbol name={stage.icon as any} size={10} color="#FFFFFF" />}
                    </View>
                    <ThemedText style={[s.journeyLabel, { color: labelColor }]}>{stage.label}</ThemedText>
                  </View>
                  {idx < JOURNEY_STAGES.length - 1 && (
                    <View style={[s.journeyConnector, { backgroundColor: isCompleted ? '#22C55E' : colors.backgroundTertiary }]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </Card>
      </View>

      {/* Current Pathway Progress */}
      <View style={s.moduleContainer}>
        <SectionHeader title="CURRENT PATHWAY" colors={colors} />
        <Card colors={colors}>
          <View style={s.pathwayHeaderRow}>
            <View style={s.pathwayHeaderLeft}>
              <ThemedText style={[s.pathwayName, { color: colors.text }]}>{MY_PATHWAY_PROGRESS.name}</ThemedText>
              <ThemedText style={[s.pathwayStepInfo, { color: colors.textSecondary }]}>
                Step {MY_PATHWAY_PROGRESS.currentStep} of {MY_PATHWAY_PROGRESS.totalSteps}
              </ThemedText>
            </View>
            <View style={[s.pathwayPercentBadge, { backgroundColor: '#1D9BF020' }]}>
              <ThemedText style={[s.pathwayPercentText, { color: '#1D9BF0' }]}>
                {MY_PATHWAY_PROGRESS.progress}%
              </ThemedText>
            </View>
          </View>
          <View style={s.pathwayProgressRow}>
            <View style={s.pathwayProgressTrack}>
              <View style={[s.pathwayProgressFill, { width: `${MY_PATHWAY_PROGRESS.progress}%` }]} />
            </View>
          </View>
          <View style={[s.pathwayMilestone, { backgroundColor: colors.backgroundTertiary }]}>
            <IconSymbol name="flag.fill" size={12} color="#F59E0B" />
            <ThemedText style={[s.pathwayMilestoneText, { color: colors.textSecondary }]}>
              Next: {MY_PATHWAY_PROGRESS.nextMilestone}
            </ThemedText>
          </View>
        </Card>
      </View>

      {/* Active Courses / Studies */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ACTIVE STUDIES" colors={colors} count={MY_ACTIVE_STUDIES.length} />
        <Card colors={colors}>
          {MY_ACTIVE_STUDIES.map((study, idx) => (
            <Pressable
              key={study.id}
              style={[
                s.studyRow,
                idx < MY_ACTIVE_STUDIES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={s.studyLeft}>
                <ThemedText style={[s.studyTitle, { color: colors.text }]} numberOfLines={1}>
                  {study.title}
                </ThemedText>
                <ThemedText style={[s.studyMeta, { color: colors.textSecondary }]}>
                  {study.leader} {'\u00B7'} {study.dayTime}
                </ThemedText>
                <ThemedText style={[s.studyNext, { color: colors.textTertiary }]}>
                  Next session: {study.nextSession}
                </ThemedText>
              </View>
              <View style={s.studyRight}>
                <ThemedText style={[s.studyPercent, { color: '#1D9BF0' }]}>
                  {study.progress}%
                </ThemedText>
                <View style={s.studyProgressBar}>
                  <View style={[s.studyProgressFill, { width: `${study.progress}%` }]} />
                </View>
              </View>
            </Pressable>
          ))}
        </Card>
      </View>

      {/* Spiritual Habits Tracker */}
      <View style={s.moduleContainer}>
        <SectionHeader title="SPIRITUAL HABITS" colors={colors} />
        <View style={s.habitsGrid}>
          {SPIRITUAL_HABITS.map((habit) => (
            <View
              key={habit.id}
              style={[s.habitTile, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[s.habitIconWrap, { backgroundColor: habit.color + '20' }]}>
                <IconSymbol name={habit.icon as any} size={16} color={habit.color} />
              </View>
              <ThemedText style={[s.habitValue, { color: colors.text }]}>{habit.value}</ThemedText>
              <ThemedText style={[s.habitLabel, { color: colors.textSecondary }]}>{habit.label}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Growth Milestones */}
      <View style={s.moduleContainer}>
        <SectionHeader title="GROWTH MILESTONES" colors={colors} />
        <Card colors={colors}>
          {GROWTH_MILESTONES.map((milestone, idx) => (
            <View
              key={milestone.id}
              style={[
                s.milestoneRow,
                idx < GROWTH_MILESTONES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[
                s.milestoneCheck,
                {
                  backgroundColor: milestone.completed ? '#22C55E' : 'transparent',
                  borderColor: milestone.completed ? '#22C55E' : colors.border,
                },
              ]}>
                {milestone.completed && <IconSymbol name="checkmark" size={10} color="#fff" />}
              </View>
              <ThemedText style={[
                s.milestoneLabel,
                { color: milestone.completed ? colors.text : colors.textTertiary },
                milestone.completed && s.milestoneCompleted,
              ]}>
                {milestone.label}
              </ThemedText>
              {!milestone.completed && (
                <View style={[s.milestoneInProgressBadge, { backgroundColor: '#1D9BF020' }]}>
                  <ThemedText style={[s.milestoneInProgressText, { color: '#1D9BF0' }]}>IN PROGRESS</ThemedText>
                </View>
              )}
            </View>
          ))}
        </Card>
      </View>

      {/* Next Step Recommendation */}
      <View style={s.moduleContainer}>
        <SectionHeader title="RECOMMENDED NEXT STEP" colors={colors} />
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Card colors={colors}>
            <View style={s.nextStepHeader}>
              <IconSymbol name="arrow.right.circle.fill" size={20} color="#1D9BF0" />
              <ThemedText style={[s.nextStepTitle, { color: colors.text }]}>{NEXT_STEP.title}</ThemedText>
            </View>
            <ThemedText style={[s.nextStepDesc, { color: colors.textSecondary }]}>
              {NEXT_STEP.description}
            </ThemedText>
            <View style={[s.nextStepCTA, { borderColor: '#1D9BF040' }]}>
              <ThemedText style={[s.nextStepCTAText, { color: '#1D9BF0' }]}>{NEXT_STEP.cta}</ThemedText>
            </View>
          </Card>
        </Pressable>
      </View>
    </>
  );
}

// =============================================================================
// VIEW: PATHWAYS
// =============================================================================

function PathwaysView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const isPublic = role === 'C5';

  return (
    <>
      <View style={s.moduleContainer}>
        <SectionHeader title="DISCIPLESHIP PATHWAYS" colors={colors} count={DISCIPLESHIP_PATHWAYS.length} />
        {DISCIPLESHIP_PATHWAYS.map((pathway) => {
          const typeColor = PATHWAY_TYPE_COLORS[pathway.type] ?? '#A1A1AA';
          const diffColor = DIFFICULTY_COLORS[pathway.difficulty] ?? '#A1A1AA';

          return (
            <Pressable
              key={pathway.id}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Card colors={colors}>
                {/* Header */}
                <View style={s.pwHeader}>
                  <View style={s.pwHeaderLeft}>
                    <ThemedText style={[s.pwName, { color: colors.text }]}>{pathway.name}</ThemedText>
                    <View style={s.pwBadgeRow}>
                      <View style={[s.pwTypeBadge, { backgroundColor: typeColor + '20' }]}>
                        <ThemedText style={[s.pwTypeBadgeText, { color: typeColor }]}>
                          {pathway.type.toUpperCase()}
                        </ThemedText>
                      </View>
                      <View style={[s.pwDiffBadge, { backgroundColor: diffColor + '20' }]}>
                        <ThemedText style={[s.pwDiffBadgeText, { color: diffColor }]}>
                          {pathway.difficulty.toUpperCase()}
                        </ThemedText>
                      </View>
                      <View style={[s.pwTypeBadge, { backgroundColor: ENROLLMENT_TYPE_COLORS[pathway.enrollmentType] + '20' }]}>
                        <ThemedText style={[s.pwTypeBadgeText, { color: ENROLLMENT_TYPE_COLORS[pathway.enrollmentType] }]}>
                          {ENROLLMENT_TYPE_LABELS[pathway.enrollmentType].toUpperCase()}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={s.pwStageCountWrap}>
                    <ThemedText style={[s.pwStageCountValue, { color: colors.text }]}>{pathway.stageCount}</ThemedText>
                    <ThemedText style={[s.pwStageCountLabel, { color: colors.textTertiary }]}>stages</ThemedText>
                  </View>
                </View>

                <ThemedText style={[s.pwDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {pathway.description}
                </ThemedText>

                {/* Details row */}
                <View style={s.pwDetailsRow}>
                  <View style={s.pwDetail}>
                    <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
                    <ThemedText style={[s.pwDetailText, { color: colors.textTertiary }]}>
                      {pathway.estimatedWeeks} weeks
                    </ThemedText>
                  </View>
                  <View style={s.pwDetail}>
                    <IconSymbol name="person.2.fill" size={11} color={colors.textTertiary} />
                    <ThemedText style={[s.pwDetailText, { color: colors.textTertiary }]}>
                      {pathway.enrolledCount} enrolled
                    </ThemedText>
                  </View>
                </View>

                {/* Stages preview */}
                <View style={s.pwStagesRow}>
                  {pathway.stages.slice(0, 4).map((stage, i) => (
                    <View key={i} style={[s.pwStagePill, { backgroundColor: colors.backgroundTertiary }]}>
                      <ThemedText style={[s.pwStagePillText, { color: colors.textSecondary }]}>{stage}</ThemedText>
                    </View>
                  ))}
                  {pathway.stages.length > 4 && (
                    <View style={[s.pwStagePill, { backgroundColor: colors.backgroundTertiary }]}>
                      <ThemedText style={[s.pwStagePillText, { color: colors.textTertiary }]}>
                        +{pathway.stages.length - 4} more
                      </ThemedText>
                    </View>
                  )}
                </View>

                {/* Enroll CTA */}
                {!isPublic && (
                  <Pressable
                    style={({ pressed }) => [
                      s.pwEnrollBtn,
                      { borderColor: typeColor + '40', opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <ThemedText style={[s.pwEnrollBtnText, { color: typeColor }]}>
                      {pathway.enrollmentType === 'open' ? 'Enroll Now' : pathway.enrollmentType === 'approval' ? 'Request to Enroll' : 'Request Invite'}
                    </ThemedText>
                  </Pressable>
                )}
              </Card>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

// =============================================================================
// VIEW: GROUPS
// =============================================================================

function GroupsView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [typeFilter, setTypeFilter] = useState('All');
  const typeOptions = ['All', 'Bible Study', 'Book Study', 'Mentoring', 'Accountability', 'Discussion'];

  const filtered = DISCIPLESHIP_GROUPS.filter((g) => {
    return typeFilter === 'All' || g.type === typeFilter;
  });

  return (
    <>
      {/* Start a Group CTA (staff+) */}
      {isStaffLevel(role) && (
        <View style={s.moduleContainer}>
          <Pressable
            style={({ pressed }) => [
              s.startGroupBtn,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="plus.circle.fill" size={20} color="#22C55E" />
            <ThemedText style={[s.startGroupBtnText, { color: colors.text }]}>Start a New Group</ThemedText>
          </Pressable>
        </View>
      )}

      {/* Type filter pills */}
      <View style={s.moduleContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {typeOptions.map((opt) => (
            <Pressable
              key={opt}
              style={[
                s.filterPill,
                {
                  backgroundColor: typeFilter === opt ? colors.text + '15' : 'transparent',
                  borderColor: colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTypeFilter(opt);
              }}
            >
              <ThemedText style={[s.filterPillText, { color: typeFilter === opt ? colors.text : colors.textSecondary }]}>
                {opt}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Group list */}
      <View style={s.moduleContainer}>
        <SectionHeader title="DISCIPLESHIP GROUPS" colors={colors} count={filtered.length} />
        {filtered.map((group) => {
          const typeColor = GROUP_TYPE_COLORS[group.type] ?? '#A1A1AA';
          const fillPct = Math.round((group.currentMembers / group.capacity) * 100);
          const isFull = group.currentMembers >= group.capacity;

          return (
            <Pressable
              key={group.id}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Card colors={colors}>
                <View style={s.groupHeader}>
                  <View style={s.groupHeaderLeft}>
                    <ThemedText style={[s.groupName, { color: colors.text }]}>{group.name}</ThemedText>
                    <ThemedText style={[s.groupLeader, { color: colors.textSecondary }]}>
                      Led by {group.leader}
                    </ThemedText>
                  </View>
                  <View style={s.groupBadges}>
                    <View style={[s.groupTypeBadge, { backgroundColor: typeColor + '20' }]}>
                      <ThemedText style={[s.groupTypeBadgeText, { color: typeColor }]}>
                        {group.type.toUpperCase()}
                      </ThemedText>
                    </View>
                    <View style={[s.groupOpenBadge, { backgroundColor: JOIN_TYPE_COLORS[group.joinType] + '20' }]}>
                      <ThemedText style={[s.groupOpenBadgeText, { color: JOIN_TYPE_COLORS[group.joinType] }]}>
                        {JOIN_TYPE_LABELS[group.joinType]}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <ThemedText style={[s.groupTopic, { color: colors.textSecondary }]}>
                  {group.topic}
                </ThemedText>

                <View style={s.groupDetailsRow}>
                  <View style={s.groupDetail}>
                    <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                    <ThemedText style={[s.groupDetailText, { color: colors.textTertiary }]}>
                      {group.dayTime}
                    </ThemedText>
                  </View>
                  <View style={s.groupDetail}>
                    <IconSymbol name="mappin.circle.fill" size={11} color={colors.textTertiary} />
                    <ThemedText style={[s.groupDetailText, { color: colors.textTertiary }]} numberOfLines={1}>
                      {group.location}
                    </ThemedText>
                  </View>
                </View>

                <View style={s.groupBottomRow}>
                  <View style={s.groupCapacity}>
                    <View style={s.groupCapacityBar}>
                      <View style={[s.groupCapacityFill, { width: `${fillPct}%`, backgroundColor: isFull ? '#EF4444' : '#22C55E' }]} />
                    </View>
                    <ThemedText style={[s.groupCapacityText, { color: isFull ? '#EF4444' : colors.textTertiary }]}>
                      {group.currentMembers}/{group.capacity} members
                    </ThemedText>
                  </View>

                  {/* Group health (leaders only) */}
                  {isStaffLevel(role) && (
                    <View style={s.groupHealth}>
                      <ThemedText style={[s.groupHealthText, { color: colors.textTertiary }]}>
                        Att: {group.avgAttendance}%
                      </ThemedText>
                      <ThemedText style={[s.groupHealthText, { color: group.engagementScore >= 90 ? '#22C55E' : group.engagementScore >= 80 ? '#1D9BF0' : '#F59E0B' }]}>
                        Eng: {group.engagementScore}
                      </ThemedText>
                    </View>
                  )}
                </View>

                {/* Join button */}
                {isMember(role) && !isFull && (
                  <Pressable
                    style={({ pressed }) => [
                      s.groupJoinBtn,
                      { borderColor: JOIN_TYPE_COLORS[group.joinType] + '40', opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <ThemedText style={[s.groupJoinBtnText, { color: JOIN_TYPE_COLORS[group.joinType] }]}>
                      {group.joinType === 'open' ? 'Join Group' : group.joinType === 'request' ? 'Request to Join' : 'Request Invite'}
                    </ThemedText>
                  </Pressable>
                )}
              </Card>
            </Pressable>
          );
        })}
        {filtered.length === 0 && (
          <Card colors={colors}>
            <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>
              No groups match the current filter.
            </ThemedText>
          </Card>
        )}
      </View>
    </>
  );
}

// =============================================================================
// VIEW: RESOURCES
// =============================================================================

function ResourcesView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');

  // Collect unique topic tags
  const allTopics = Array.from(new Set(DISCIPLESHIP_RESOURCES.flatMap((r) => r.topicTags))).sort();

  // Filter by audience scope based on role
  const scopeFiltered = DISCIPLESHIP_RESOURCES.filter((r) => {
    if (r.audienceScope === 'all') return true;
    if (r.audienceScope === 'leaders') return isStaffLevel(role);
    return true; // pathway-specific visible to all
  });

  const featured = scopeFiltered.filter((r) => r.featured);

  const filtered = scopeFiltered.filter((r) => {
    const matchesSearch = search.length === 0 ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.author.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || r.type === categoryFilter;
    const matchesTopic = topicFilter === 'All' || r.topicTags.includes(topicFilter);
    return matchesSearch && matchesCategory && matchesTopic;
  });

  return (
    <>
      {/* Featured Resource Highlight */}
      {featured.length > 0 && (
        <View style={s.moduleContainer}>
          <SectionHeader title="FEATURED" colors={colors} />
          {featured.map((res) => {
            const typeColor = RESOURCE_TYPE_COLORS[res.type] ?? '#A1A1AA';
            return (
              <Pressable
                key={res.id}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={[s.featuredCard, { backgroundColor: colors.card, borderColor: typeColor + '40' }]}>
                  <View style={s.featuredHeader}>
                    <View style={[s.featuredTypeBadge, { backgroundColor: typeColor + '20' }]}>
                      <ThemedText style={[s.featuredTypeText, { color: typeColor }]}>{res.type.toUpperCase()}</ThemedText>
                    </View>
                    <View style={[s.featuredDiffBadge, { backgroundColor: DIFFICULTY_COLORS[res.difficulty] + '20' }]}>
                      <ThemedText style={[s.featuredDiffText, { color: DIFFICULTY_COLORS[res.difficulty] }]}>
                        {res.difficulty.toUpperCase()}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[s.featuredTitle, { color: colors.text }]}>{res.title}</ThemedText>
                  <ThemedText style={[s.featuredAuthor, { color: colors.textSecondary }]}>by {res.author}</ThemedText>
                  <ThemedText style={[s.featuredDesc, { color: colors.textTertiary }]} numberOfLines={2}>
                    {res.description}
                  </ThemedText>
                  <ThemedText style={[s.featuredRec, { color: colors.textTertiary }]}>
                    Recommended for: {res.recommendedFor}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Search bar */}
      <View style={s.moduleContainer}>
        <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search resources..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Category filter pills */}
      <View style={s.moduleContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {RESOURCE_CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[
                s.filterPill,
                {
                  backgroundColor: categoryFilter === cat ? colors.text + '15' : 'transparent',
                  borderColor: colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCategoryFilter(cat);
              }}
            >
              <ThemedText style={[s.filterPillText, { color: categoryFilter === cat ? colors.text : colors.textSecondary }]}>
                {cat}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Topic filter chips */}
      <View style={s.moduleContainer}>
        <SectionHeader title="TOPICS" colors={colors} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          <Pressable
            style={[s.filterPill, { backgroundColor: topicFilter === 'All' ? colors.text + '15' : 'transparent', borderColor: colors.border }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTopicFilter('All'); }}
          >
            <ThemedText style={[s.filterPillText, { color: topicFilter === 'All' ? colors.text : colors.textSecondary }]}>All</ThemedText>
          </Pressable>
          {allTopics.map((topic) => (
            <Pressable
              key={topic}
              style={[s.filterPill, { backgroundColor: topicFilter === topic ? colors.text + '15' : 'transparent', borderColor: colors.border }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTopicFilter(topic); }}
            >
              <ThemedText style={[s.filterPillText, { color: topicFilter === topic ? colors.text : colors.textSecondary }]}>{topic}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Resource library */}
      <View style={s.moduleContainer}>
        <SectionHeader title="RESOURCE LIBRARY" colors={colors} count={filtered.length} />
        <Card colors={colors}>
          {filtered.map((res, idx) => {
            const typeColor = RESOURCE_TYPE_COLORS[res.type] ?? '#A1A1AA';
            const diffColor = DIFFICULTY_COLORS[res.difficulty] ?? '#A1A1AA';

            return (
              <Pressable
                key={res.id}
                style={[
                  s.resourceRow,
                  idx < filtered.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={[s.resourceTypeIcon, { backgroundColor: typeColor + '20' }]}>
                  <IconSymbol
                    name={
                      res.type === 'Book' ? 'book.fill' :
                      res.type === 'Video Series' ? 'play.rectangle.fill' :
                      res.type === 'Study Guide' ? 'doc.text.fill' :
                      res.type === 'Devotional' ? 'heart.text.square.fill' :
                      res.type === 'Worksheet' ? 'doc.on.clipboard.fill' :
                      'link' as any
                    }
                    size={14}
                    color={typeColor}
                  />
                </View>
                <View style={s.resourceInfo}>
                  <View style={s.resourceTitleRow}>
                    <ThemedText style={[s.resourceTitle, { color: colors.text }]} numberOfLines={1}>
                      {res.title}
                    </ThemedText>
                  </View>
                  <ThemedText style={[s.resourceAuthor, { color: colors.textSecondary }]}>
                    {res.author}
                  </ThemedText>
                  <ThemedText style={[s.resourceDesc, { color: colors.textTertiary }]} numberOfLines={1}>
                    {res.description}
                  </ThemedText>
                  <View style={s.resourceBadgeRow}>
                    <View style={[s.resourceBadge, { backgroundColor: typeColor + '15' }]}>
                      <ThemedText style={[s.resourceBadgeText, { color: typeColor }]}>{res.type}</ThemedText>
                    </View>
                    <View style={[s.resourceBadge, { backgroundColor: diffColor + '15' }]}>
                      <ThemedText style={[s.resourceBadgeText, { color: diffColor }]}>{res.difficulty}</ThemedText>
                    </View>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
              </Pressable>
            );
          })}
          {filtered.length === 0 && (
            <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>
              No resources match your search.
            </ThemedText>
          )}
        </Card>
      </View>
    </>
  );
}

// =============================================================================
// VIEW: LEADER TOOLS (C1/C2 only)
// =============================================================================

function LeaderToolsView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const inTraining = LEADER_PIPELINE.filter((l) => l.status === 'in-training').length;
  const ready = LEADER_PIPELINE.filter((l) => l.status === 'ready').length;
  const leading = LEADER_PIPELINE.filter((l) => l.status === 'leading').length;

  return (
    <>
      {/* KPIs */}
      <View style={s.moduleContainer}>
        <SectionHeader title="DISCIPLESHIP PROGRAM KPIs" colors={colors} />
        <View style={s.kpiGrid}>
          {LEADER_KPIS.map((kpi) => (
            <View
              key={kpi.id}
              style={[s.kpiTile, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <IconSymbol name={kpi.icon as any} size={18} color={colors.textSecondary} />
              <ThemedText style={[s.kpiValue, { color: colors.text }]}>{kpi.value}</ThemedText>
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>{kpi.label}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Pathway Performance Table */}
      <View style={s.moduleContainer}>
        <SectionHeader title="PATHWAY PERFORMANCE" colors={colors} count={PATHWAY_PERFORMANCE.length} />
        <Card colors={colors}>
          {/* Header row */}
          <View style={[s.perfTableRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingBottom: 8, marginBottom: 4 }]}>
            <ThemedText style={[s.perfTableName, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>PATHWAY</ThemedText>
            <ThemedText style={[s.perfTableStat, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>ENRL</ThemedText>
            <ThemedText style={[s.perfTableStat, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>ACTV</ThemedText>
            <ThemedText style={[s.perfTableStat, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>COMP</ThemedText>
            <ThemedText style={[s.perfTableStat, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>DROP</ThemedText>
          </View>
          {PATHWAY_PERFORMANCE.map((pw, idx) => (
            <View
              key={pw.id}
              style={[
                s.perfTableRow,
                idx < PATHWAY_PERFORMANCE.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <ThemedText style={[s.perfTableName, { color: colors.text }]} numberOfLines={1}>
                {pw.name}
              </ThemedText>
              <ThemedText style={[s.perfTableStat, { color: colors.text }]}>{pw.enrolled}</ThemedText>
              <ThemedText style={[s.perfTableStat, { color: colors.text }]}>{pw.active}</ThemedText>
              <ThemedText style={[s.perfTableStat, { color: '#22C55E' }]}>{pw.completed}</ThemedText>
              <ThemedText style={[s.perfTableStat, { color: pw.dropOffRate >= 15 ? '#EF4444' : pw.dropOffRate >= 10 ? '#F59E0B' : colors.textSecondary }]}>
                {pw.dropOffRate}%
              </ThemedText>
            </View>
          ))}
        </Card>
      </View>

      {/* Leader Pipeline */}
      <View style={s.moduleContainer}>
        <SectionHeader title="LEADER PIPELINE" colors={colors} count={LEADER_PIPELINE.length} />

        {/* Pipeline summary */}
        <View style={s.pipelineSummaryRow}>
          <View style={[s.pipelineSummaryItem, { backgroundColor: '#F59E0B20' }]}>
            <ThemedText style={[s.pipelineSummaryValue, { color: '#F59E0B' }]}>{inTraining}</ThemedText>
            <ThemedText style={[s.pipelineSummaryLabel, { color: '#F59E0B' }]}>In Training</ThemedText>
          </View>
          <View style={[s.pipelineSummaryItem, { backgroundColor: '#1D9BF020' }]}>
            <ThemedText style={[s.pipelineSummaryValue, { color: '#1D9BF0' }]}>{ready}</ThemedText>
            <ThemedText style={[s.pipelineSummaryLabel, { color: '#1D9BF0' }]}>Ready to Lead</ThemedText>
          </View>
          <View style={[s.pipelineSummaryItem, { backgroundColor: '#22C55E20' }]}>
            <ThemedText style={[s.pipelineSummaryValue, { color: '#22C55E' }]}>{leading}</ThemedText>
            <ThemedText style={[s.pipelineSummaryLabel, { color: '#22C55E' }]}>Currently Leading</ThemedText>
          </View>
        </View>

        <Card colors={colors}>
          {LEADER_PIPELINE.map((leader, idx) => {
            const statusColor = PIPELINE_STATUS_COLORS[leader.status] ?? '#A1A1AA';
            const progress = Math.round((leader.completedModules / leader.totalModules) * 100);

            return (
              <View
                key={leader.id}
                style={[
                  s.pipelineRow,
                  idx < LEADER_PIPELINE.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={s.pipelineLeft}>
                  <View style={s.pipelineNameRow}>
                    <StatusDot status={leader.status} />
                    <ThemedText style={[s.pipelineName, { color: colors.text }]}>{leader.name}</ThemedText>
                    <View style={[s.pipelineStatusBadge, { backgroundColor: statusColor + '20' }]}>
                      <ThemedText style={[s.pipelineStatusText, { color: statusColor }]}>
                        {leader.status === 'in-training' ? 'IN TRAINING' : leader.status.toUpperCase()}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[s.pipelineMinistry, { color: colors.textSecondary }]}>
                    {leader.ministry} Ministry
                  </ThemedText>
                </View>
                <View style={s.pipelineRight}>
                  {leader.status === 'in-training' ? (
                    <>
                      <View style={s.pipelineProgressBar}>
                        <View style={[s.pipelineProgressFill, { width: `${progress}%`, backgroundColor: statusColor }]} />
                      </View>
                      <ThemedText style={[s.pipelineProgressText, { color: colors.textTertiary }]}>
                        {leader.completedModules}/{leader.totalModules}
                      </ThemedText>
                    </>
                  ) : (
                    <IconSymbol name="checkmark.circle.fill" size={16} color={statusColor} />
                  )}
                </View>
              </View>
            );
          })}
        </Card>
      </View>

      {/* Placement Queue */}
      <View style={s.moduleContainer}>
        <SectionHeader title="PLACEMENT QUEUE" colors={colors} count={UNPLACED_MEMBERS.filter((m) => m.status !== 'placed').length} />
        <Card colors={colors}>
          {UNPLACED_MEMBERS.map((member, idx) => {
            const statusColor = member.status === 'awaiting' ? '#F59E0B' : member.status === 'contacted' ? '#1D9BF0' : '#22C55E';
            return (
              <View
                key={member.id}
                style={[s.placementRow, idx < UNPLACED_MEMBERS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
              >
                <View style={s.placementInfo}>
                  <ThemedText style={[s.placementName, { color: colors.text }]}>{member.name}</ThemedText>
                  <ThemedText style={[s.placementMeta, { color: colors.textTertiary }]}>Joined {member.joinedDate}</ThemedText>
                  <View style={s.placementTagsRow}>
                    {member.interests.map((interest) => (
                      <View key={interest} style={[s.placementTag, { backgroundColor: colors.backgroundTertiary }]}>
                        <ThemedText style={[s.placementTagText, { color: colors.textSecondary }]}>{interest}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={[s.placementStatusBadge, { backgroundColor: statusColor + '20' }]}>
                  <ThemedText style={[s.placementStatusText, { color: statusColor }]}>{member.status.toUpperCase()}</ThemedText>
                </View>
              </View>
            );
          })}
        </Card>
      </View>

      {/* At-Risk Members */}
      <View style={s.moduleContainer}>
        <SectionHeader title="AT-RISK MEMBERS" colors={colors} count={AT_RISK_MEMBERS.length} />
        <Card colors={colors}>
          {AT_RISK_MEMBERS.map((member, idx) => {
            const riskColor = member.riskLevel === 'critical' ? '#EF4444' : '#F59E0B';
            return (
              <View
                key={member.id}
                style={[s.atRiskRow, idx < AT_RISK_MEMBERS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
              >
                <View style={[s.atRiskDot, { backgroundColor: riskColor }]} />
                <View style={s.atRiskInfo}>
                  <ThemedText style={[s.atRiskName, { color: colors.text }]}>{member.name}</ThemedText>
                  <ThemedText style={[s.atRiskMeta, { color: colors.textSecondary }]}>{member.pathway}</ThemedText>
                  <ThemedText style={[s.atRiskMeta, { color: colors.textTertiary }]}>Last activity: {member.lastActivity} ({member.daysInactive}d ago)</ThemedText>
                </View>
                <View style={[s.atRiskBadge, { backgroundColor: riskColor + '20' }]}>
                  <ThemedText style={[s.atRiskBadgeText, { color: riskColor }]}>{member.riskLevel.toUpperCase()}</ThemedText>
                </View>
              </View>
            );
          })}
        </Card>
      </View>

      {/* Cohort Management */}
      <View style={s.moduleContainer}>
        <SectionHeader title="COHORT MANAGEMENT" colors={colors} count={COHORTS.length} />
        {COHORTS.map((cohort) => {
          const statusColor = COHORT_STATUS_COLORS[cohort.status] ?? '#A1A1AA';
          return (
            <Card key={cohort.id} colors={colors}>
              <View style={s.cohortHeader}>
                <View style={s.cohortHeaderLeft}>
                  <ThemedText style={[s.cohortName, { color: colors.text }]}>{cohort.name}</ThemedText>
                  <ThemedText style={[s.cohortPathway, { color: colors.textSecondary }]}>{cohort.pathway}</ThemedText>
                </View>
                <View style={[s.cohortStatusBadge, { backgroundColor: statusColor + '20' }]}>
                  <ThemedText style={[s.cohortStatusText, { color: statusColor }]}>{cohort.status.toUpperCase()}</ThemedText>
                </View>
              </View>
              <View style={s.cohortDetailsRow}>
                <View style={s.cohortDetail}>
                  <IconSymbol name="calendar" size={10} color={colors.textTertiary} />
                  <ThemedText style={[s.cohortDetailText, { color: colors.textTertiary }]}>{cohort.startDate} — {cohort.endDate}</ThemedText>
                </View>
                <View style={s.cohortDetail}>
                  <IconSymbol name="person.2.fill" size={10} color={colors.textTertiary} />
                  <ThemedText style={[s.cohortDetailText, { color: colors.textTertiary }]}>{cohort.enrolled} enrolled</ThemedText>
                </View>
              </View>
            </Card>
          );
        })}
      </View>

      {/* Growth Trends */}
      <View style={s.moduleContainer}>
        <SectionHeader title="GROWTH TRENDS" colors={colors} />
        <Card colors={colors}>
          {/* Header row */}
          <View style={[s.trendTableRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingBottom: 8, marginBottom: 4 }]}>
            <ThemedText style={[s.trendTableMonth, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>MONTH</ThemedText>
            <ThemedText style={[s.trendTableStat, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>NEW</ThemedText>
            <ThemedText style={[s.trendTableStat, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>COMP</ThemedText>
            <ThemedText style={[s.trendTableStat, { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }]}>ENG%</ThemedText>
          </View>
          {GROWTH_TRENDS.map((trend, idx) => (
            <View
              key={trend.id}
              style={[
                s.trendTableRow,
                idx < GROWTH_TRENDS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <ThemedText style={[s.trendTableMonth, { color: colors.text }]}>{trend.month}</ThemedText>
              <ThemedText style={[s.trendTableStat, { color: '#1D9BF0' }]}>{trend.newEnrollments}</ThemedText>
              <ThemedText style={[s.trendTableStat, { color: '#22C55E' }]}>{trend.completions}</ThemedText>
              <ThemedText style={[s.trendTableStat, { color: trend.engagement >= 80 ? '#22C55E' : trend.engagement >= 75 ? '#F59E0B' : '#EF4444' }]}>
                {trend.engagement}%
              </ThemedText>
            </View>
          ))}
        </Card>
      </View>

      {/* Action CTAs */}
      <View style={s.moduleContainer}>
        <View style={s.leaderActionsRow}>
          <Pressable
            style={({ pressed }) => [
              s.leaderActionBtn,
              { backgroundColor: colors.card, borderColor: '#1D9BF040', opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="plus.circle.fill" size={18} color="#1D9BF0" />
            <ThemedText style={[s.leaderActionBtnText, { color: '#1D9BF0' }]}>Create Pathway</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              s.leaderActionBtn,
              { backgroundColor: colors.card, borderColor: '#1D9BF040', opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="plus.circle.fill" size={18} color="#1D9BF0" />
            <ThemedText style={[s.leaderActionBtnText, { color: '#1D9BF0' }]}>Create Resource</ThemedText>
          </Pressable>
        </View>
      </View>
    </>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChurchDiscipleship({ colors, role = 'C1', onSwitchTab }: Props) {
  const visibleViews = getAvailableViews(role);
  const [activeView, setActiveView] = useState<DiscipleshipView>(getDefaultView(role));

  const renderView = () => {
    switch (activeView) {
      case 'my-path':
        return <MyPathView colors={colors} role={role} />;
      case 'pathways':
        return <PathwaysView colors={colors} role={role} />;
      case 'groups':
        return <GroupsView colors={colors} role={role} />;
      case 'resources':
        return <ResourcesView colors={colors} role={role} />;
      case 'leader-tools':
        return <LeaderToolsView colors={colors} role={role} />;
      default:
        return <MyPathView colors={colors} role={role} />;
    }
  };

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* View pill toggle -- only show if more than one view */}
      {visibleViews.length > 1 && (
        <View style={s.viewToggleContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.viewToggleRow}>
            {visibleViews.map((view) => {
              const isActive = activeView === view.id;
              return (
                <Pressable
                  key={view.id}
                  style={[
                    s.viewPill,
                    {
                      backgroundColor: isActive ? colors.text + '15' : 'transparent',
                      borderColor: isActive ? colors.text + '30' : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveView(view.id);
                  }}
                >
                  <ThemedText style={[s.viewPillText, { color: isActive ? colors.text : colors.textSecondary }]}>
                    {view.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Active view content */}
      {renderView()}

      {/* Bottom spacer */}
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

  // View toggle
  viewToggleContainer: { marginBottom: Spacing.lg },
  viewToggleRow: { flexDirection: 'row', gap: Spacing.sm },
  viewPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  viewPillText: { fontSize: 13, fontWeight: '600' },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },

  // Filter pills
  filterRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  filterPillText: { fontSize: 12, fontWeight: '600' },

  // Empty state
  emptyText: { fontSize: 13, textAlign: 'center', paddingVertical: Spacing.lg },

  // ---- MY PATH: Current Pathway ----
  pathwayHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  pathwayHeaderLeft: { flex: 1 },
  pathwayName: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  pathwayStepInfo: { fontSize: 13 },
  pathwayPercentBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.md },
  pathwayPercentText: { fontSize: 16, fontWeight: '800' },
  pathwayProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  pathwayProgressTrack: { flex: 1, height: 6, backgroundColor: '#2F3336', borderRadius: 3, overflow: 'hidden' },
  pathwayProgressFill: { height: '100%', backgroundColor: '#1D9BF0', borderRadius: 3 },
  pathwayMilestone: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: Spacing.sm, borderRadius: BorderRadius.md },
  pathwayMilestoneText: { fontSize: 12, flex: 1 },

  // ---- MY PATH: Active Studies ----
  studyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  studyLeft: { flex: 1 },
  studyTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  studyMeta: { fontSize: 12, marginBottom: 1 },
  studyNext: { fontSize: 10 },
  studyRight: { alignItems: 'flex-end', gap: 3, minWidth: 50 },
  studyPercent: { fontSize: 14, fontWeight: '700' },
  studyProgressBar: { width: 50, height: 4, borderRadius: 2, backgroundColor: '#2F3336', overflow: 'hidden' },
  studyProgressFill: { height: '100%', borderRadius: 2, backgroundColor: '#1D9BF0' },

  // ---- MY PATH: Spiritual Habits ----
  habitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  habitTile: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  habitIconWrap: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  habitValue: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  habitLabel: { fontSize: 11, fontWeight: '500' },

  // ---- MY PATH: Growth Milestones ----
  milestoneRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  milestoneCheck: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  milestoneLabel: { fontSize: 13, fontWeight: '500', flex: 1 },
  milestoneCompleted: {},
  milestoneInProgressBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  milestoneInProgressText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // ---- MY PATH: Next Step ----
  nextStepHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  nextStepTitle: { fontSize: 16, fontWeight: '700' },
  nextStepDesc: { fontSize: 13, lineHeight: 19, marginBottom: Spacing.md },
  nextStepCTA: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth },
  nextStepCTAText: { fontSize: 13, fontWeight: '600' },

  // ---- PATHWAYS ----
  pwHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 },
  pwHeaderLeft: { flex: 1 },
  pwName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  pwBadgeRow: { flexDirection: 'row', gap: 6 },
  pwTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  pwTypeBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  pwDiffBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  pwDiffBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  pwStageCountWrap: { alignItems: 'center', paddingLeft: Spacing.sm },
  pwStageCountValue: { fontSize: 20, fontWeight: '800' },
  pwStageCountLabel: { fontSize: 10, fontWeight: '500' },
  pwDesc: { fontSize: 12, lineHeight: 17, marginBottom: Spacing.sm },
  pwDetailsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  pwDetail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pwDetailText: { fontSize: 11 },
  pwStagesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: Spacing.sm },
  pwStagePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  pwStagePillText: { fontSize: 10, fontWeight: '500' },
  pwEnrollBtn: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 7, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth },
  pwEnrollBtnText: { fontSize: 13, fontWeight: '600' },

  // ---- MY PATH: Journey Strip ----
  journeyStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0, paddingVertical: Spacing.sm },
  journeyStageWrap: { alignItems: 'center', gap: 4, minWidth: 40 },
  journeyDot: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  journeyDotCurrent: { width: 26, height: 26, borderRadius: 13 },
  journeyLabel: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  journeyConnector: { width: 12, height: 2, borderRadius: 1, marginBottom: 16 },

  // ---- GROUPS ----
  startGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  startGroupBtnText: { fontSize: 14, fontWeight: '600' },
  groupHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
  groupHeaderLeft: { flex: 1 },
  groupName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  groupLeader: { fontSize: 12 },
  groupBadges: { flexDirection: 'column', gap: 4, alignItems: 'flex-end' },
  groupTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  groupTypeBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  groupOpenBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  groupOpenBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  groupTopic: { fontSize: 13, marginBottom: Spacing.sm },
  groupDetailsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.sm },
  groupDetail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  groupDetailText: { fontSize: 11 },
  groupBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  groupCapacity: { flex: 1 },
  groupCapacityBar: { width: 80, height: 4, borderRadius: 2, backgroundColor: '#2F3336', overflow: 'hidden', marginBottom: 3 },
  groupCapacityFill: { height: '100%', borderRadius: 2 },
  groupCapacityText: { fontSize: 10 },
  groupHealth: { flexDirection: 'row', gap: Spacing.sm },
  groupHealthText: { fontSize: 10, fontWeight: '600' },
  groupJoinBtn: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth, marginTop: Spacing.sm },
  groupJoinBtnText: { fontSize: 12, fontWeight: '600' },

  // ---- RESOURCES ----
  featuredCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  featuredHeader: { flexDirection: 'row', gap: 6, marginBottom: Spacing.sm },
  featuredTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  featuredTypeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  featuredDiffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  featuredDiffText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  featuredTitle: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  featuredAuthor: { fontSize: 13, marginBottom: Spacing.sm },
  featuredDesc: { fontSize: 12, lineHeight: 17, marginBottom: Spacing.sm },
  featuredRec: { fontSize: 10, fontStyle: 'italic' },

  resourceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  resourceTypeIcon: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  resourceInfo: { flex: 1 },
  resourceTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 1 },
  resourceTitle: { fontSize: 13, fontWeight: '600', flex: 1 },
  resourceAuthor: { fontSize: 11, marginBottom: 2 },
  resourceDesc: { fontSize: 11, marginBottom: 4 },
  resourceBadgeRow: { flexDirection: 'row', gap: 4 },
  resourceBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: BorderRadius.sm },
  resourceBadgeText: { fontSize: 9, fontWeight: '600' },

  // ---- LEADER TOOLS: KPIs ----
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  kpiTile: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 4,
  },
  kpiValue: { fontSize: 24, fontWeight: '800' },
  kpiLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center' },

  // ---- LEADER TOOLS: Pathway Performance Table ----
  perfTableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: Spacing.sm },
  perfTableName: { fontSize: 12, fontWeight: '600', flex: 1 },
  perfTableStat: { fontSize: 12, fontWeight: '600', width: 40, textAlign: 'right' },

  // ---- LEADER TOOLS: Leader Pipeline ----
  pipelineSummaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  pipelineSummaryItem: { flex: 1, borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center' },
  pipelineSummaryValue: { fontSize: 20, fontWeight: '800' },
  pipelineSummaryLabel: { fontSize: 10, fontWeight: '600' },
  pipelineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  pipelineLeft: { flex: 1 },
  pipelineNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  pipelineName: { fontSize: 13, fontWeight: '600' },
  pipelineStatusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  pipelineStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  pipelineMinistry: { fontSize: 11, marginLeft: 12 },
  pipelineRight: { alignItems: 'flex-end', gap: 3, minWidth: 50 },
  pipelineProgressBar: { width: 50, height: 4, borderRadius: 2, backgroundColor: '#2F3336', overflow: 'hidden' },
  pipelineProgressFill: { height: '100%', borderRadius: 2 },
  pipelineProgressText: { fontSize: 9 },

  // ---- LEADER TOOLS: Placement Queue ----
  placementRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
  placementInfo: { flex: 1 },
  placementName: { fontSize: 13, fontWeight: '600', marginBottom: 1 },
  placementMeta: { fontSize: 10, marginBottom: 4 },
  placementTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  placementTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  placementTagText: { fontSize: 9, fontWeight: '500' },
  placementStatusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  placementStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // ---- LEADER TOOLS: At-Risk ----
  atRiskRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, gap: 8 },
  atRiskDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  atRiskInfo: { flex: 1 },
  atRiskName: { fontSize: 13, fontWeight: '600', marginBottom: 1 },
  atRiskMeta: { fontSize: 10, marginBottom: 1 },
  atRiskBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  atRiskBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // ---- LEADER TOOLS: Cohort Management ----
  cohortHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  cohortHeaderLeft: { flex: 1 },
  cohortName: { fontSize: 14, fontWeight: '700', marginBottom: 1 },
  cohortPathway: { fontSize: 11 },
  cohortStatusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  cohortStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  cohortDetailsRow: { flexDirection: 'row', gap: Spacing.md },
  cohortDetail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cohortDetailText: { fontSize: 10 },

  // ---- LEADER TOOLS: Growth Trends ----
  trendTableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: Spacing.sm },
  trendTableMonth: { fontSize: 12, fontWeight: '600', flex: 1 },
  trendTableStat: { fontSize: 12, fontWeight: '600', width: 40, textAlign: 'right' },

  // ---- LEADER TOOLS: Action CTAs ----
  leaderActionsRow: { flexDirection: 'row', gap: Spacing.sm },
  leaderActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  leaderActionBtnText: { fontSize: 13, fontWeight: '600' },
});
